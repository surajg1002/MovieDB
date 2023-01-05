var moviePerPage = 10; // Only 10 movies per page
var url_str = location.href; // File loctaion

var url = new URL(url_str);
var search_params = url.searchParams;
var myPath = url.pathname.replace('/', ''); // remove slash from url path

var logUser = sessionStorage.getItem("user"), 
logPass = sessionStorage.getItem("pass"); // stores session storage data

// If user not login it redirect to login page
if ((logUser === null) && (logPass === null) && (myPath != 'login.html')) {
    location.href = location.origin + '/login.html';
}

// If user login it not able to navigate to login page
if (logUser && logPass && (myPath == 'login.html')) {
        location.href = location.origin + '/movies_page.html';
}

// View more page functionality
if (myPath === 'view_more.html') {
    var movieCategory = search_params.get('cat'),
    prevBtn = document.querySelector('.prev-btn'),
    nextBtn = document.querySelector('.next-btn'),
    paginationNo = document.querySelector('.pagination-list span'),
    pageNo = paginationNo.innerText;
    prevBtn.classList.add('hide-btn');

    // View more movie functionality with pagination
    viewMore(movieCategory, pageNo);

    prevBtn.removeEventListener('click', prevFunc); 

    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        pageNo++;
        paginationNo.innerText = pageNo;
        prevBtn.classList.remove('hide-btn')
        viewMore(movieCategory, pageNo);  
        
        prevBtn.addEventListener('click', prevFunc);
    })
    
    function prevFunc(e) {
        e.preventDefault();
        pageNo--;
        paginationNo.innerText = pageNo;
        if (pageNo === 1) {
            prevBtn.classList.add('hide-btn');  
            prevBtn.removeEventListener('click', prevFunc);   
        }
        viewMore(movieCategory, pageNo);
    }
    
    function viewMore(category, pageNo) {
        fetch(`https://api.themoviedb.org/3/${category}?api_key=f849a0f5ac2189842be41ca5f970a392&page=${pageNo}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var movies = data.results,
                viewMoreContainer = document.querySelector('.view-more .wrapper'),
                pagination = document.querySelector('.pagination');
                // viewMoreContainer.innerHTML = '';
                var urlCategory = category.split('/');
                if (urlCategory[0] === 'trending') {
                    urlCategory = urlCategory[1];
                } else {
                    urlCategory = urlCategory[0];
                }
                for (let i = 0; i < moviePerPage; i++) {
                    var li = document.createElement('ul'),
                    movieName = movies[i].title ? movies[i].title : movies[i].name;
                    li.className = 'view-more-content';
                    li.innerHTML =`<li class="content-list">
                                    <a href="./details_page.html?id=${movies[i].id}&cat=${urlCategory}" class="movie-click" title="${movieName}">${movieName}</a>
                                    <figure><img src="https://image.tmdb.org/t/p/w185/${movies[i].backdrop_path}" title="poster" alt="List"></figure>
                                    <h2 class="movie-name">${movieName}</h2>
                                    <div class="mdb-rating">
                                    <a href="#FIXME" class="rate-icon">star</a>
                                    <span class="rating">${movies[i].vote_average}</span>
                                    </div>
                                    <a href="#FIXME" class="user-rating">star</a>
                                    </li>`;
                   

                    viewMoreContainer.insertBefore(li, pagination);
                }
            })
    }
}
// View more movie functionality with pagination end here

// Detail page 
if (myPath === 'details_page.html') {
    var movieId = search_params.get('id');
    var movieCategory = search_params.get('cat');
    
    // user rating 
    var starList = document.querySelectorAll('.star-list');
    var favourite = document.querySelector('.save');
   
    showFavourite();
    favourite.addEventListener('click',addFavourite)
    function addFavourite(){
        var favouriteActive = localStorage.getItem("favourite"+movieId);
        if (favouriteActive == 1){
            localStorage.setItem("favourite"+movieId, 0);
            favourite.parentElement.classList.remove('favourite-active');
        } else{
            localStorage.setItem("favourite"+movieId, 1);
            favourite.parentElement.classList.add('favourite-active');
        }
    }

    function showFavourite(){
        var favouriteActive = localStorage.getItem("favourite"+movieId);
        if (favouriteActive == 1){
            favourite.parentElement.classList.add('favourite-active');
        } else{
            favourite.parentElement.classList.remove('favourite-active');
        }
    }


    starList.forEach(function(item, index){ 
        item.classList.remove('star-list-active');
        item.addEventListener('mouseover',function(){
            for(var i = 0; i<= index; i++){
                starList[i].classList.add('star-list-active');
            }
        })
        item.addEventListener('mouseout',function(){

            var star = localStorage.getItem("star");
            for(var i = 0; i<= index; i++){
                starList[i].classList.remove('star-list-active');
                
            }
            rate();
        })
        item.addEventListener('click',function(){
            localStorage.setItem("star"+movieId, index+1);
            rate();
        })
    })
    rate();
    function rate() {
        var star = localStorage.getItem("star"+movieId);
        starList.forEach(function(item, index){ 
            item.classList.remove('star-list-active');
        })
        if(star){
            for(var i = 0; i<= star-1; i++){
                starList[i].classList.add('star-list-active');
            }
        }
    }
    // user rate end here

    // Show deatil movie functionality
    showDetail(movieId, movieCategory);

    function showDetail(movieId, movieCategory) {
        fetch(`https://api.themoviedb.org/3/${movieCategory}/${movieId}?api_key=f849a0f5ac2189842be41ca5f970a392`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var image = document.querySelector('.movie-image img'),
                    name = document.querySelector('.movie-name'),
                    about = document.querySelector('.about'),
                    date = document.querySelector('.release h3'),
                    time = document.querySelector('.time h3'),
                    revenue = document.querySelector('.box h3'),
                    vote = document.querySelector('.vote h3');
                image.src = `https://image.tmdb.org/t/p/w185/${data.poster_path}`;
                name.innerText = data.title ? data.title : data.name;
                about.innerText = data.overview;
                date.innerText = data.release_date ? data.release_date : data.first_air_date;
                time.innerText = data.runtime ? data.runtime + ' mins' : data.last_episode_to_air.runtime + ' mins';
                revenue.innerText = data.revenue ? '$' + data.revenue : '$' + data.id;
                vote.innerText = data.vote_average + '/10';
            })    
    }
}
// Show deatil movie functionality end here

// movie page functionality
if (myPath === 'movies_page.html') {
    var movieTab = document.querySelectorAll('.movie-btn'),
    movieActive = document.querySelectorAll('.nav-menu li a'),
    movieContainer = document.querySelector('.movie-categories-content'),
    ul = document.createElement('ul');
    ul.className = 'movie-categories-content';
    menuActive(movieActive);
    showMovie('movie/top_rated');
    movieTab.forEach(function(item){
        
        var tabCategory = item.getAttribute('data-control');
        switch (tabCategory) {
            case 'rated':
                item.addEventListener('click',function() {
                    activeTab(item);
                    showMovie('movie/top_rated');
                });
                break;
            case 'popular':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('movie/popular');
                });
                break;
            case 'news':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('trending/movie/week');
                });
                break;
            case 'playing':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('movie/now_playing');
                });
                break;
            case 'upcomings':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('movie/upcoming');
                });
                break;
        }
    })
}
// Movie page functionality end here

// Tv show page functionality
if (myPath === 'tv_shows_page.html') {
    var movieTab = document.querySelectorAll('.tvshow-btn'),
    movieActive = document.querySelectorAll('.nav-menu li a'),
    movieContainer = document.querySelector('.tvshow-categories-content'),
    ul = document.createElement('ul');
    ul.className = 'tvshow-categories-content';
    menuActive(movieActive);
    
    showMovie('tv/top_rated');
    movieTab.forEach(function(item){
        var tabCategory = item.getAttribute('data-control');
        switch (tabCategory) {
            case 'rated':
                item.addEventListener('click',function() {
                    activeTab(item);
                    showMovie('tv/top_rated');
                });
                break;
            case 'popular':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('tv/popular');
                });
                break;
            case 'air':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('tv/on_the_air');
                });
                break;
            case 'today':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('tv/airing_today');
                });
                break;
            case 'news':
                item.addEventListener('click',function(){
                    activeTab(item);
                    showMovie('trending/tv/week');
                });
                break;
        }
    })
}
// Tv show functionality end here

// function for showing current active tab
function activeTab(item){
    movieTab.forEach(function(tab){
        tab.classList.remove('active');
    })
    item.classList.add('active');
}
// function for showing current active tab end here

// Movie category functionality start here
function showMovie(category) {
    fetch(`https://api.themoviedb.org/3/${category}?api_key=f849a0f5ac2189842be41ca5f970a392`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var movies = data.results,
            wrapper = document.querySelector('.tv-shows .wrapper') || document.querySelector('.movies .wrapper'),
            viewMore = document.querySelector('.view-more-btn');
            viewMore.href = 'view_more.html?cat='+category;
            ul.innerHTML = '';
            if (ul.classList.contains('slick-initialized') && ul.classList.contains('slick-slider')){
                ul.classList.remove('slick-initialized');
                ul.classList.remove('slick-slider');
            }
            ul.classList.add('movie-list-container');
            ul.setAttribute('data-category', category);
            var urlCategory = category.split('/');
            if (urlCategory[0] === 'trending') {
                urlCategory = urlCategory[1];
            } else {
                urlCategory = urlCategory[0];
            }
            for (let i = 0; i < moviePerPage; i++) {
                var movieName = movies[i].title ? movies[i].title : movies[i].name,
                li = document.createElement('li');
                li.className = "movie-categories-content-list";
                li.innerHTML = `<a href="./details_page.html?id=${movies[i].id}&cat=${urlCategory}" title="${movieName}">
                            <figure><img src="https://image.tmdb.org/t/p/w185/${movies[i].poster_path}" alt="movie poster" title="${movieName}"></figure>
                            <div class="name-rating">
                            <h2 class="name">${movieName}</h2>
                            <a href="#FIXME" class="rating">${movies[i].vote_average}</a>
                            </div></a>`;

                ul.appendChild(li)
                wrapper.insertBefore(ul,viewMore);

            }

            var list = document.querySelector('.movie-list-container');
            if (list) {
                $(document).ready(function(){
                    $('.movie-list-container').slick({
                        dots: true,
                        infinite: false,
                        speed: 300,
                        slidesToShow: 4,
                        slidesToScroll: 4,
                        responsive: [
                          {
                            breakpoint: 1024,
                            settings: {
                              slidesToShow: 3,
                              slidesToScroll: 3,
                              infinite: true,
                              dots: true
                            }
                          },
                          {
                            breakpoint: 600,
                            settings: {
                              slidesToShow: 2,
                              slidesToScroll: 2
                            }
                          },
                          {
                            breakpoint: 480,
                            settings: {
                              slidesToShow: 1,
                              slidesToScroll: 1
                            }
                          }
                          // You can unslick at a given breakpoint now by adding:
                          // settings: "unslick"
                          // instead of a settings object
                        ]
                      });
                })
            }
        })
}
// Movie category functionality end here

if (myPath != 'login.html') {
var search = document.querySelector('.search-box'),
logoutBtn = document.querySelector('.logout-button a');

// Functionality for searching movies
search.addEventListener('keyup', function(e) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=f849a0f5ac2189842be41ca5f970a392&query=${search.value}&include_adult=false`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var suggest = document.querySelector('.srch-suggest'),
                movies = data.results;
                suggest.innerHTML = '';
                suggest.classList.add('srch-suggest-active');

                if (data.total_results != 0) {
            movies.forEach(function(movie) {
                var list = document.createElement('li');
                    list.className = 'srch-suggest-list';
                    list.innerHTML = `<a href="./details_page.html?id=${movie.id}&cat=movie" class="srch-anchor" title="Movie">${movie.title}</a>`;

                suggest.appendChild(list);
            });
        } else {
            var list = document.createElement('li');
                    list.className = 'srch-suggest-list';
            list.innerHTML = "No result found";
            suggest.appendChild(list);
        }
    });
})
// Functionality for searching movies end here

logoutBtn.addEventListener('click', function () {
    sessionStorage.clear();
    location.href = location.origin + '/login.html';
})

// Functionality for hamburger menu
var menuToggle = document.querySelector('.menu-toggle');
var nav = document.querySelector('nav');
var html = document.querySelector('html');

menuToggle.addEventListener('click',function(){
    navMenuToggle();
})
function navMenuToggle() {
  var bars = menuToggle.querySelectorAll(".bar");

  for (var i = 0; i < bars.length; i++) {
    bars[i].classList.toggle("active");
  }

  nav.classList.toggle("active");
  html.classList.toggle("overflow-hidden");
}
}
// Functionality for hamburger menu end 

// Login page authorization functionality
if (myPath === 'login.html') {
    localStorage.setItem("username", "suraj@gmail.com");
    localStorage.setItem("password", "Suraj@2000");

    var username = document.querySelector('#loginEmail'),
    password = document.querySelector('#loginPassword'),
    errorAlert = document.querySelector('.errorAlert'),
    emailValidate = document.querySelector('.email-error'),
    passValidate = document.querySelector('.pass-error'),
    form = document.querySelector('.form-login'),
    patternEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var user = localStorage.getItem("username"),
        pass = localStorage.getItem("password");
        if (username.value && password.value) {
            emailValidate.classList.remove('error-validate-active');
            passValidate.classList.remove('error-validate-active');
            if ((username.value === user) && (password.value === pass)) {
                sessionStorage.setItem("user", username.value);
                sessionStorage.setItem("pass", password.value);
                if (errorAlert.classList.contains('errorAlert-active')) {
                    errorAlert.classList.remove('errorAlert-active');
                }
                location.href = location.origin + '/movies_page.html';
            } else {
                errorAlert.innerText = "Invalid username or password";
                errorAlert.classList.add('errorAlert-active');
            }
        } else {
            showError(username, username.value, patternEmail, 'Invalid email address');
            showError(password, password.value);
        }
    })
    //  showing error form validation
    function showError(input, value, pattern = '', message = '') {
        var errorElement = input.nextElementSibling;
        
        if (value) {
            errorElement.classList.remove('error-validate-active');
            if (pattern) {
                if (value.match(pattern)) {
                    errorElement.classList.remove('error-validate-active');
                } else {
                    errorElement.innerText = message;
                    errorElement.classList.add('error-validate-active');
                }
            }
        } else {
            errorElement.innerText = 'Field is required';
            errorElement.classList.add('error-validate-active');
        }
    }
}

// Menu active function
function menuActive(movieActive){
    movieActive.forEach(function(tab){
        var url = tab.getAttribute('href');
        if (myPath === url){
            tab.classList.add('active');
        }
    })
}