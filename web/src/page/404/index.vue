

<template>
    <div class="page404">
      <h1>404</h1>
      <router-link to="home">home</router-link>
    </div>
  </template>

  <script>
  export default {
    data() {
      return {
        num: Math.floor(Math.random() * (1 - 1000) + 1000),
      };
    },
    mounted() {

    },
    methods: {

    },
  };
  </script>
  <!-- lang="less" scoped -->
  <style scoped>
  .page404{
    text-align: center;
  }
  </style>
