<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>


<script>
  import firebase from 'firebase'
  // @ is an alias to /src
  export default {
    name: 'about',
    beforeCreate: function(){
      if (!firebase.auth().currentUser){
        this.$router.replace('/')
      }
    }
  }
</script>
