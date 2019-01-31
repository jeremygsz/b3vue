<template>
    <div class="hello">
        <h1>{{ msg }}</h1>

        <button v-on:click="login">login</button>
        <button v-if="user" v-on:click="logout">logout</button>

        <h1 v-if="user">{{ user.displayName }}</h1>
        <transition-group name="list" tag="ul">
            <li v-for="item in markdownTablo" v-bind:key="item.ts">
                {{ item.ts }} : {{ item.displayName }}
                <div v-html="item.message"/>
            </li>
        </transition-group>
        <canvas ref="imgCanvas"></canvas>
        <form v-if="user" @submit="tamerelapute">
            <input type="file" ref="fileInput" @change="loadFile">
            <input v-model="message" placeholder="texte">
            <input type="submit" value="Submit">
        </form>
    </div>
</template>

<script>
    import firebase from 'firebase'
    import marked from 'marked'

    export default {
        name: 'HelloWorld',
        props: {
            msg: String
        },
        data() {
            return {
                user: false,
                tablo: [],
                message: ''
            }
        },
        // define methods under the `methods` object
        methods: {
            tamerelapute: function (e) {
                if (this.user) {
                    let entry = {
                        ts: new Date().getTime(),
                        uid: this.user.uid,
                        displayName: this.user.displayName,
                        message: this.message.toString()
                    }

                    firebase.database().ref('messages/').push(entry, (error) => {
                        if (error) {
                            alert("dla merde")
                        } else {
                            // alert("yeah")
                            this.message = '';
                        }
                    });
                }
                e && e.preventDefault();
            },
            loadFile: function (event) {
                if(event.target.files[0]) {
                    const file = event.target.files[0];
                    //const reader = new FileReader();
                    // TODO : check si c'est une image
                    let img = new Image;
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        let canvas = this.$refs['imgCanvas']
                        let ctx = canvas.getContext('2d')
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 200, 100)
                        canvas.toBlob(blob => {
                            // inject into storage then send msg
                            firebase.storage().ref('images/').child(file.name)
                                .put(blob)
                                .then(snapshot => {
                                    snapshot.ref.getDownloadURL()
                                        .then(downloadURL => {
                                            this.message = "![prout](" + downloadURL + ")"
                                            this.tamerelapute()
                                            // TODO : cleanup canvas && fileinput
                                        });
                                })

                        }, 'image/webp', 0.8)
                    };
                }
            },
            login: function () {

                let googleAuthProvider = new firebase.auth.GoogleAuthProvider()
                googleAuthProvider.addScope('https://www.googleapis.com/auth/plus.login')
                //firebase.auth().languageCode = 'fr'
                firebase.auth().signInWithPopup(googleAuthProvider)
            },
            logout: function () {
                firebase.auth().signOut()
            }
        },
        computed: {
            markdownTablo: function () {
                return (this.tablo).map(entry => {
                    return ({
                        ts: entry.ts,
                        uid: entry.uid,
                        displayName: entry.displayName,
                        message: marked((entry.message).toString(), {sanitize: true})
                    })
                })

            }
        },
        mounted: function () {
            firebase.database().ref('messages/').on('value', snapshot => {
                if (snapshot.val() !== null) {
                    this.tablo = Object.values(snapshot.val())
                }
            });
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    // User is signed in.
                    this.user = user
                } else {
                    // No user is signed in.
                    this.user = false
                }
            });
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .list-enter-active, .list-leave-active {
        transition: all 1s;
    }

    .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */
    {
        opacity: 0;
        transform: translateY(30px);
    }

    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        // display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
