[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]


<br />
<p align="center">
  <a href="https://github.com/timotismjntk/Mobile-News-Backend">
    <img src="https://raw.githubusercontent.com/timotismjntk/RuangDev/master/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png" alt="Logo" width="120" height="120">
  </a>

  <h3 align="center">Ruang Dev - Backend</h3>

  <p align="center">
    Ruang Dev - Backend API for Mobile App
    <br />
</p>



<!-- TABLE OF CONTENTS -->
<h2>Table of Contents</h2>
<ul>
  <li>
    <a href="#about-the-project">About The Project</a>
    <ul>
      <li><a href="#built-with">Built With</a></li>
    </ul>
  </li>
  <li>
    <a href="#getting-started">Getting Started</a>
    <ul>
      <li><a href="#prerequisites">Prerequisites</a></li>
      <li><a href="#installation">Installation</a></li>
    </ul>
  </li>
  <li><a href="#api-docs">Api Docs</a></li>
  <li><a href="#contact">Contact</a></li>
</ul>


<!-- ABOUT THE PROJECT -->
## About The Project

This is Backend for mobile App RuangDev.

### Built With

* bcryptjs
* body-parser
* cors
* express
* jsonwebtoken
* morgan
* multer
* mysql2
* sequelize
* uuid


<!-- GETTING STARTED -->
## Getting Started

This is a simple backend for RuangDev App.

## Prerequisites

This is list things you need to use the packages and how to install them.
* yarn
  ```sh
  npm install -g yarn
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/timotismjntk/Mobile-News-Backend.git
   ```
2. Install Depedencies
   ```sh
   yarn install
   ```
3. Create Database with sequelize
   ```sh
   yarn sequelize db:create
   ```
4. Create Migration with sequelize
   ```sh
   yarn sequelize db:migrate
   ```
5. Run Project
   ```sh
   nodemon
   ```
<!-- API -->
## Api Docs
See the route of Api with [Postman Docs API](https://www.getpostman.com/collections/ed46341b75cd9a101d38)

<!-- CONTACT -->
## Contact
Project Link: [https://github.com/timotismjntk/Mobile-News-Backend](https://github.com/timotismjntk/Mobile-News-Backend)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[forks-shield]: https://img.shields.io/github/forks/timotismjntk/Mobile-News-Backend
[forks-url]: https://github.com/timotismjntk/Mobile-News-Backend/network/members
[stars-shield]: https://img.shields.io/github/stars/timotismjntk/Mobile-News-Backend
[stars-url]: https://github.com/timotismjntk/Mobile-News-Backend/stargazers
[issues-shield]: https://img.shields.io/github/issues/timotismjntk/Mobile-News-Backend
[issues-url]: https://github.com/timotismjntk/Mobile-News-Backend/issues
