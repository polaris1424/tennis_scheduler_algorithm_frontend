# SWEN90017-90018 ACE Frontend

## Project Setup
The **release version** of the project runs on **docker images**, to build and run the project, please follow the **instructions** regading **Backend repository README**. 

> The following section is the **Frontend environment setup for development**. 

## Introduction
> This project uses **yarn** to manage **Next.JS** packages. This project uses [Yarn](https://yarnpkg.com/) as the package manager to manage dependencies and scripts. **Yarn** is a fast, secure, and reliable alternative to npm. This guide will help you install **Yarn** globally using npm and get started with it in your project.

## Installing yarn

### macOS

Install Yarn directly:

```sh
brew install yarn
```

### Windows

Before proceeding, ensure that you have [Node.js](https://nodejs.org/) installed on your machine. Yarn requires Node.js to run. You can verify that Node.js and npm are installed by running the following commands: 

node -v npm -v

```sh
node -v 
```

```sh
npm -v
```

To install Yarn globally on your system, use npm (which is included when you install Node.js). Run the following command in your terminal:

```sh
npm install -g yarn
```

After the installation is complete, you can verify that Yarn was installed correctly by checking its version:

```sh
yarn -v
```

## How To Run

### 1. Go to Frontend Directory
```sh
cd frontend
```

### 2. Install Dependencies
```sh
yarn
```

### 3. Compile & Run The Frontend
```sh
yarn run dev
```