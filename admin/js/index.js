'use strict';
const date = new Date();

let signupForm = document.getElementById('signup-form');
let loginForm = document.getElementById('login-form');

if (loginForm || signupForm != null) {
    loginForm.style.display = 'none';

    let signupBtn = document.getElementById('signup-btn');
    let loginBtn = document.getElementById('login-btn');

    signupBtn.addEventListener('click', function (e) {
        e.preventDefault();
        signupUser();
    });

    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginUser();
    });
}

let loginBtns = Array.from(document.getElementsByClassName('login'));
loginBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        switchSignup();
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    });
});

let signupBtns = Array.from(document.getElementsByClassName('signup'));
signupBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        switchLogin();
    });
});

let switchLogin = () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
}

let switchSignup = () => {
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

let signupUser = () => {
    const newUser = {
        firstname: document.getElementById('firstname-signup').value,
        lastname: document.getElementById('lastname-signup').value,
        email: document.getElementById('email-signup').value,
        password: document.getElementById('password-signup').value,
        blogposts: [],
        recipes: [],
        calendarposts: []
    }

    const rptPw = document.getElementById('rptpassword-signup').value;

    if (newUser.password == rptPw) {
        if(checkEmail(newUser.email)){
            console.log(checkEmail(newUser.email))
        postData('http://127.0.0.1:12345/signup', newUser)
            .then(data => {
                if (data.resp == "false") {
                    document.getElementById('signup-warn').style.display = 'block';
                    document.getElementById('signup-warn').innerHTML = 'Email adress already in use';
                } else {
                    document.getElementById('signup-succes').style.display = 'block';
                    document.getElementById('signup-warn').style.display = 'none';
                    setTimeout(switchSignup(), 2000);
                };
            });
        document.getElementById('signup-warn').style.display = 'none';
        }else{
            document.getElementById('signup-warn').style.display = 'block';
            document.getElementById('signup-warn').innerHTML = 'Incorrect email';
        }
    } else {
        document.getElementById('signup-warn').style.display = 'block';
        document.getElementById('signup-warn').innerHTML = 'Incorrect repeated password';
    }
}

let checkEmail = email =>{
    if(email.includes('@') && email.includes('.') && email.indexOf('.') > 0 && email.indexOf('.') < email.length){
        return true;
    }else{
        return false
    }
}

let loginUser = () => {
    const loggedInUser = {
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    }
    try {
        postData('http://127.0.0.1:12345/login', loggedInUser)
            .then(data => {
                if (data.resp == 'falsepw') {
                    document.getElementById('login-warn').style.display = 'block';
                } else if (data.resp == 'falseusername') {
                    document.getElementById('login-username-warn').style.display = 'block';
                } else {
                    document.getElementById('login-warn').style.display = 'none';
                    localStorage.setItem('loggedIn', true);
                    localStorage.setItem('userId', data._id);
                    localStorage.setItem('name', data.firstname);
                    window.location.href = 'addpost.html';
                }
            });
    } catch (err) {
        console.log(err);
    }
}

function showCalendarInputs(type) {
    let inputBtn = document.getElementById(`${type}-input`);
    let inputDiv = document.getElementById(`${type}-input-opts`);
    if (inputBtn.checked) {
        inputDiv.style.display = 'flex';
    } else {
        inputDiv.style.display = 'none';
    }
}

let voedingOptsBtn = document.getElementById('voeding-input');
if (voedingOptsBtn != null) {
    voedingOptsBtn.addEventListener('click', function () {
        const voedingOptsDiv = document.getElementById('voeding-input-opts');
        if (voedingOptsBtn.checked) {
            voedingOptsDiv.style.display = 'block';
        } else {
            voedingOptsDiv.style.display = 'none';
        }
    });
}

let toggleExtraPostOpts = (type) => {
    let optsBtn = document.getElementById(`${type}-input`);
    optsBtn.addEventListener('click', function () {
        const optsDiv = document.getElementById(`${type}-input-opts`);
        if (optsBtn.checked) {
            optsDiv.style.display = 'flex';
        } else {
            optsDiv.style.display = 'none';
        }
    })
}


if (document.getElementById('addpost-form') != null && document.querySelector('#manage-posts #addpost-form') == null) {
    toggleExtraPostOpts('voeding');
    toggleExtraPostOpts('workshops');

    let addPost = () => {
        let submitPostBtn = document.getElementById('submit-post');
        submitPostBtn.addEventListener('click', function (e) {
            e.preventDefault();
            Array.from(document.querySelectorAll('#tags input[type="checkbox"]')).forEach(checkbox => {});

            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const newPost = {
                title: document.getElementById('title-post').value,
                content: CKEDITOR.instances.posteditor.getData(),
                description: document.getElementById('description-post').value,
                img: document.getElementById('img-post').value,
                tags: [],
                user: localStorage.getItem('userId'),
                day: day,
                month: month,
                year: year
            }
            let checkedTags = document.querySelectorAll('#tags input[type="checkbox"]:checked');
            Array.from(checkedTags).forEach(tag => {
                const tagName = tag.id;
                const tagToUppercase = tagName.charAt(0).toUpperCase() + tagName.slice(1);
                newPost.tags.push(tagToUppercase.replace('-input', ''));
            })
            if (newPost.tags.includes('Voeding')) {
                newPost.recept = {};
                newPost.recept.ingredients = [];
                let ingredientInputs = Array.from(document.querySelectorAll('.ingredients-input'));
                ingredientInputs.forEach(input => {
                    newPost.recept.ingredients.push(input.value);
                });
                let selectedEditions = [];
                Array.from(document.querySelectorAll('input[name="edition"]')).forEach(inp => {
                    if (inp.checked) {
                        selectedEditions.push(inp.nextSibling.innerHTML);
                    }
                });
                let selectedTime = [];
                Array.from(document.querySelectorAll('input[name="time"]')).forEach(inp => {
                    if (inp.checked) {
                        selectedTime.push(inp.nextSibling.innerHTML);
                    }
                });
                newPost.recept.edition = selectedEditions;
                newPost.recept.time = selectedTime;
                newPost.recept.cookdur = document.getElementById('cookdur').value;
                newPost.recept.amtpeople = document.getElementById('amtpeople').value;
            }
            if (newPost.tags.includes('Workshops')) {
                newPost.workshop = {};
                newPost.workshop.timeFrom = document.getElementById('starthour-input').value;
                newPost.workshop.timeTo = document.getElementById('endhour-input').value;
                newPost.workshop.location = document.getElementById('location-input').value;
                newPost.workshop.day = document.getElementById('day-input').value;
                newPost.workshop.month = document.getElementById('month-input').value;
                newPost.workshop.year = document.getElementById('year-input').value;
            }

            postData('http://127.0.0.1:12345/addpost', newPost)
                .then(data => {
                    window.location.href = "addpost.html";
                    showPosts();
                });
        });
    }
    let addInputBtn = document.getElementById('add-input');

    if (addInputBtn != null) {
        addInputBtn.addEventListener('click', function () {
            this.parentNode.insertAdjacentHTML('beforeend', `
        <input class="ingredients-input" type="text" name="ingredients-input">
        `)
        });
        addPost();
    }
}

const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNav = document.getElementById('main-nav');
hamburgerMenu.addEventListener('click', function () {
    if (mainNav.style.display === "none") {
        mainNav.style.display = "block";
    } else {
        mainNav.style.display = "none";
    }
    this.src = '';
});