<template>
  <div class="wrapper-items m-t-10 flex flex-column">
  
  <div class="box-items flex flex-warp">

      <vs-item v-for="(item, index) in items.data" :key="items.data.id"
          :item="item"
          :is-request="isRequest"
          :height="height"
      ></vs-item>
      
      <div v-if="items.data.length === 0" class="nothing-found">
        <div class="button is-warning is-static is-large">NOTHING FOUND !</div>
      </div>

      <hr>
  
  </div>

  <div class="box-pagination" v-if="pagination.total > pagination.perPage">

  <b-pagination
      :total="pagination.total"
      :current.sync="pagination.current"
      :order="pagination.order"
      :size="pagination.size"
      :simple="false"
      :rounded="true"
      :per-page="pagination.perPage"
      @change="paginate($event)"
  ></b-pagination>

  </div>

      </div>
</template>

<style>
.wrapper-items{
  flex: 1;
  border:0px solid green;
}

.wrapper-items-title{
  font-family: Anton;
  text-transform: capitalize;
  font-size: 1.2em;
}

.box-items{
  flex:1;
}

.box-pagination{
  margin: 5px;
  padding:10px;
}

.nothing-found{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
export default {

    props:{
        items : {
          type : Object,
          default(){
            return {}
          }
        },

        type : {
          type : String,
          default : ''
        },

        isRequest : {
          type : Boolean,
          default : false
        },

        

        height : {
          type : Number,
          default : 160
        }
    },

    data() {
            
        return {

          pagination: {
                total: this.items.total,
                current: this.items.current_page,
                perPage: this.items.per_page,
                order: 'is-centered',
                size: ''
          },

        }
    },

    created(){

        if (this.type === 'videos'){

              this.items.data = this.items.data.map( item => {

                    item.info = item.link;
                    return item;

              })
        }
    },  

    methods: {

        paginate(p){

            console.warn('PAGE: ' + p);
            console.log(this.getBaseUrl() + '?page=' + p);
            window.location = this.getBaseUrl() + '?page=' + p;
        },
     
        getBaseUrl(){
            return window.location.origin + window.location.pathname;
        },
   }
}
</script>