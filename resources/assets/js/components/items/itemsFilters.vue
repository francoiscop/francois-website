<template>
  <div>
  <div class="items-filter-wrapper flex flex-warp" style="height:auto;" :class="{'border-71x' : isSwitch()}">

    <!--<div class="delete" v-if="isSwitch()"></div>-->

    <div  class="flex flex-column" style="margin:10px 10px 10px 0px;align-self:center" v-if="switches.length > 0">

      <div v-for="(s, index) in switches" style="width:200px">

         <vv-switch 
            :key="index"
            :label="s.label"
            :value="s.status"
            :ref="s.label"
            size="is-small"
            @change="setSwitch($event, s.label, index)"
        ></vv-switch>
        

      </div>

    </div>

    <div class="flex" style="align-items:center;justify-content:center">   
        <vv-select  v-for="(s, index) in selects"
            :key="index"
            :placeholder-prop="s.label"
            :width="0"
            :options="s.enum"
            :value="s.value"
            :ref="s.label"
            @change="setSelect($event, index)"
            style="border:0px solid orange;"
        ></vv-select>
        <div class="button is-append-to-select"  @click="sendFilters">Filters</div>
    </div>
  </div>

    
  
  </div>
</template>

<style>
.items-filter-wrapper{
  align-content: center;
  justify-content: center;
  height: 100px;
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.items-filter-wrapper .delete{
  position:absolute;
  top: 1px;
  right: 1px;
}

.items-filter-wrapper > div{
  border:0px solid red;
}

.is-append-to-select{
  border-radius: 0;
  border: 1px solid hsl(0, 0%, 71%);
  border-left: none;
  height: 38px;
  line-height: 2;
  padding: 10px 10px;
  margin: 0;
}
.is-append-to-select:hover{
  background-color: hsl(0, 0%, 86%)
}

.c-v-select input[type="search"], .c-v-select input[type="search"]:focus{
  border:0px solid red;
}
</style>

<script>
import switchComponent from '../form/switch.vue'
import selectComponent from '../form/selectLabel.vue';

export default{

  components : {'vv-switch' : switchComponent, 'vv-select' : selectComponent},

  props : {

      filters : {
        type: Object,
        default(){
          return {}
        }
      },

      url : {
        type : String,
        default: ''
      },

      type : {
          type : String,
          default : ''
        },

  },

  data(){

      return {
        switches: [],
        selects : [],
      }
  },

  created(){

    for (let k in this.filters){

       var func = this.filters[k].type + 'Init';

       this[func](this.filters[k], k);
      
    }

  },

  methods : {

      isSwitch(){
          return this.switches.length > 0;
      },

      switchInit(obj, label){

          for (let k in obj.values){

              var status = (obj.value.indexOf(obj.values[k]) > -1) ? true : false;

              this.switches.push({ label : obj.values[k], status : status, parent : label});

          }

      },

      selectInit(obj, label){

        let arr = obj.values;

        if (Object.prototype.toString.call( obj.values ) === '[object Object]'){

            arr = Object.values(obj.values);

        }

        var value = (arr.indexOf(obj.value[0]) > -1) ? obj.value[0] : '';


           this.selects.push({ label : label, enum : arr, value : value});

      },

      setSwitch(val, label, index){

           this.switches[index].status = val;
      },

      setSelect(val, index){

          this.selects[index].value = val;
      },

      sendFilters(){

          window.location.href = this.getQuery();
      },

      getQuery(){

          const url = this.processURL();

          let switchDatas = [];
          let q = '';

          for (let k in url.params){

              var key = url.params[k];
              var type = this.filters[key].type;
              
              if (type === 'switch'){

                  let _is = false;

                  for (let j in this.switches){

                    if (this.switches[j].status) {

                      switchDatas.push(this.switches[j].label);

                      _is = true;

                    }

                  }

                  q += (_is) ? '/' + switchDatas.join(',') : '/all';
              }

              if (type === 'select'){

                  for (let j in this.selects){

                    if (this.selects[j].value && this.selects[j].value !== '') q += '/' + this.selects[j].value.replace(' ','-');

                  }

              }

          }

          return url.base + q;
      },

      processURL(){

            const arr = this.url.split('/');
            var base = '', params = [];

            for (let k in arr){

                if (!this.isParam(arr[k]) && arr[k] !== '') base += '/' + arr[k];
                else if (arr[k] !== '') params.push(arr[k].replace('{','').replace('}', ''));
            }

            return {base : base, params : params};
      },

      isParam(p){

          return p.indexOf('{') > -1;
      }, 

    }
}
</script>