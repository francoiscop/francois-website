class Errors{

    constructor(){
        this.errors = [];
    }

}

class Form {

    constructor(data){

      this.originalData = data;
      this.newData = {};
      //this.errors = new Errors();
      this.errors = [];

      const templateRules = {
            title : {
                rules: ['alphanumeric']
            },
            username : {
                rules: ['alphanumeric'],
                max: 20,
                min: 5
            },
            password : {
                rules: ['match:password_confirmation'],
                min: 5
            },
            password_confirmation : {
                rules: ['match:password'],
                min: 5
            },
            email : {
                rules: ['email'],
            },
            dob : {
                rules: ['dob'],
            },
            year : {
                rules: ['integer'],
                max : 4,
                min : 4
            }
      }

      const templateTag = {
          key: 'name',
          allowNew: false,
          url : ''
      }

      for (let field in data){

          //check if Array or Object ?
          //var isArray = Object.prototype.toString.call(data) === '[object Array]';
          //var _field = (isArray) ? data[field] : field;

          var _rules = (data[field].hasOwnProperty('rules')) ? data[field].rules : 
                      ((templateRules.hasOwnProperty(field)) ? templateRules[field].rules : []);
          var _max = (data[field].hasOwnProperty('max')) ? data[field].max : 
                      ((templateRules.hasOwnProperty(field)) ? templateRules[field].max : null);
          var _min = (data[field].hasOwnProperty('min')) ? data[field].min : 
                      ((templateRules.hasOwnProperty(field)) ? templateRules[field].min : null);
          
          

          this.newData[field] = {
              value : '',
              type : null,
              enum : false,
              keyEnum : null,
              required : false,
              icon : null,
              helper: null,
              error : {
                  is : false,
                  label : null
              },
              rules : _rules,
              max : _max,
              min : _min
          }

          if (data[field].hasOwnProperty('value')) this.newData[field].value = data[field].value;
          if (data[field].hasOwnProperty('type')) this.newData[field].type = data[field].type;
          if (data[field].hasOwnProperty('enum')) this.newData[field].enum = data[field].enum;
          if (data[field].hasOwnProperty('keyEnum')) this.newData[field].keyEnum = data[field].keyEnum;
          if (data[field].hasOwnProperty('required')) this.newData[field].required = data[field].required;
          if (data[field].hasOwnProperty('icon')) this.newData[field].icon = data[field].icon;
          if (data[field].hasOwnProperty('helper')) this.newData[field].helper = data[field].helper;
          //if (data[field].hasOwnProperty('error')) this.newData[field].error = {is : true, label : data[field].error};
          if (data[field].hasOwnProperty('error')) this.newData[field].error = data[field].error;
          if (data[field].hasOwnProperty('datas')) this.newData[field].datas = data[field].datas;

          //TAGS:
          if (this.newData[field].type === 'tag'){
              this.newData[field].tag = templateTag;
              if (data[field].hasOwnProperty('tag')) this.newData[field].tag = data[field].tag;
          }

      }
    
    }
}

export default Form;