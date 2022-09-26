async function onload(){
    let params = (new URL(document.location)).searchParams;
    let authenticated = params.get("request_token");
    console.log({authenticated})

    if(authenticated === null){
        console.log('null itu')
    }else{
        const bodyContent = {
            "request_token": authenticated
        }
    
        sessionId = await acquireSessionId(`https://api.themoviedb.org/3/authentication/session/new?api_key=88312f10bfd54e14a0ec2d70966e57ff`,bodyContent
        
        );
    
    
        sessionStorage.setItem(SESSIONKEY, sessionId.session_id);
    
        getAccountInfo()
    }
};

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = '88312f10bfd54e14a0ec2d70966e57ff'
const LANGUAGE = 'en-US'
const SESSIONKEY = "TMDB_KEY"
let isLoggedIn = false


let page = 1
let clicked = false
let movieTitle = ''
let movieId = ''


const toggleSwitch = document.querySelector('[checked]');
const dropDown = document.getElementById('movie-id-dropdown')
const loginBtn = document.getElementById('login')
const movieContainer = document.getElementById('movie-result-container');
const userIcon = document.getElementsByClassName('fa-user');



movieContainer.classList.remove('active');
movieContainer.classList.add('inactive');

let sessionId= ''



loginBtn.addEventListener('click',()=>{

    sessionId = sessionStorage.getItem(SESSIONKEY);
    console.log(sessionId);

    if(sessionId === '' || sessionId === null || sessionId === 'undefined' && isLoggedIn == false){
        console.log('no session id')
        getRequestToken()
        isLoggedIn = true
    }else if(isLoggedIn == false){
        console.log('with session id')
        getAccountInfo()

        isLoggedIn = true
    } else if(isLoggedIn==true){
        sessionStorage.clear()
        location.href='https://themovie-application.netlify.app'
    }
    
})

async function acquireSessionId(url, data){

    try{
        const response = await fetch('https://api.themoviedb.org/3/authentication/session/new?api_key=88312f10bfd54e14a0ec2d70966e57ff', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
          })
        const result = await response.json();
    
        return result
    }catch(err){
        console.log(err)
    }
    
    
}

async function getRequestToken(){

    try{

        fetch('https://api.themoviedb.org/3/authentication/token/new?api_key='+API_KEY)
        .then(res=>res.json()).then(data =>{
            console.log(data)

            redirect(data)

            
        })

    }catch(err){
        console.log(err);
    }

    
    
}

async function redirect(data){
    window.location.replace(`https://www.themoviedb.org/authenticate/${data.request_token}?redirect_to=https://themovie-application.netlify.app`);
    
    /*
    const bodyContent = {
        "request_token": String(data.request_token)
    }

    sessionId = await acquireSessionId(`https://api.themoviedb.org/3/authentication/session/new?api_key=88312f10bfd54e14a0ec2d70966e57ff`,bodyContent
    
    );


    sessionStorage.setItem(SESSIONKEY, sessionId.session_id);

    getAccountInfo()
    */
    
}


function changeName(username){

    console.log(username)
    if(username == 'undefined' || username == null || username == ''){
        loginBtn.innerText = 'Signing out';
        loginBtn.classList.add('name-logged-in');


        const accName = document.getElementById('account-name');
        accName.innerText = ''
    }else{
        loginBtn.innerText = 'Sign out';
        //loginBtn.classList.add('name-logged-in');


        const accName = document.getElementById('account-name');
        accName.innerText = username
    }
    
    
}


async function getAccountInfo(){
    try{
        const sId = sessionStorage.getItem(SESSIONKEY)
        fetch(`https://api.themoviedb.org/3/account?api_key=88312f10bfd54e14a0ec2d70966e57ff&session_id=${sId}`)
        .then(res => res.json()).then(data=>{
            console.log(data.username)

            changeName(data.username);
        })

    }catch(err){

        console.log(err)

    }
}


dropDown.addEventListener('click',()=>{
    let chosenIndex = dropDown.selectedIndex;
    console.log(dropDown.options[chosenIndex].text)
    movieId = dropDown.options[chosenIndex].text

    getDetailsById()
})

toggleSwitch.addEventListener('click', () =>{
   clicked = !clicked

   console.log(clicked)

   
   getDetailsById()

})


async function searchFunction(){
    movieTitle = document.getElementById("search-title").value;
    movieId = document.getElementById("movie-id-dropdown").value;
    


    if(movieTitle == ''){
        movieContainer.classList.remove('active');
        movieContainer.classList.add('inactive');
        
        
    }else{
        movieContainer.classList.remove('inactive');
        movieContainer.classList.add('active');
        
        getDetailsByTitle()
    }
    
    
}

async function getDetailsByTitle(){
    try{
        let res = ''
        fetch(BASE_URL + '/search/movie?api_key=' + API_KEY + '&query=' +movieTitle)
        .then((res)=> res.json()).then((data)=>{
            console.log(data) 
            
            //display('title',data);
            const results = data.results;
            const movieIds = []
            results.forEach((element,key) => {
                movieIds.push(element.id);
                
            });


            movieIds.forEach((element,keys)=>{
                dropDown.options[keys] = new Option(element,keys);
            })


            

        });

    }catch(err){
        console.log(err)
    }
    

    
}


async function getDetailsById(){
    try{
        fetch(BASE_URL + `/movie/${movieId}?api_key=`+API_KEY)
        .then((res)=> res.json()).then((data)=>{
            console.log(data)


            display(data)
            
        });
    }catch(err){
        console.log(err)
    }
}


async function display(data){
    
            let movieJSON = ''
            
            if(clicked == true){
                document.getElementById("movie-info").innerHTML = `Title: ${data.original_title} <br> 
                Description: ${data.overview}`
            }else{
                movieJSON = JSON.stringify(data,null,4);
                document.getElementById("movie-info").innerHTML = `<pre id="pretty-json" style="flex-wrap: wrap;
                overflow-y:hidden; width: 95%">${movieJSON}</pre>`;
            }
}