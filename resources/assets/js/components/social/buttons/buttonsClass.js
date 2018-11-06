export default class Buttons {

    constructor(items, parentId, parentClass, counts){

        this.buttons = [];

        this.items = items;
        this.parentId = parentId;
        this.parentClass = parentClass;
        this.counts = counts;

        this.setDefault()

        this.appendAttributesItems()

        //console.warn('BUTTONS FROM CLASS : ', this.buttons)
    }

    getDefault(){
        return {
            like : {
                icon : 'thumb_up',
                isCounter : true,
                once: true
            },
            dislike : {
                icon : 'thumb_down',
                isCounter : true,
                once: true
            },
            retweet : {
                icon : 'share',
                isCounter : true,
            },
            reply : {
                icon : 'reply',
                isCounter : false,
                loading: null,
                callback : false,
                toggle : {
                    status : false, 
                    icon : 'clear',
                    tooltip: 'Close'
                }
            },
            friend : {
                icon : 'supervisor_account',
                isCounter : false,
                tooltip: 'Send friend request',
                once: true
            },
            message : {
                icon : 'email',
                isCounter : false,
                tooltip: 'Private message'
            },
            /*
            getReply : {
                icon : null,
                isCounter : true,
                minimalClass : false,
                color: 'has-text-grey-dark',
                tooltip: false,
                text: 'View Replies',
                toggle : {
                    status : false, 
                    text : 'Hide Replies'
                }
            },
            */
            replies : {
                icon: 'comment',
                isCounter : true,
                tooltip: 'View Replies',
                toggle : {
                    status : false, 
                    icon : 'clear',
                    tooltip: 'Hide Replies'
                }
            },
            comment : {
                icon: 'comment',
                isCounter : true,
                tooltip: 'View Comments',
                toggle : {
                    status : false, 
                    icon : 'clear',
                    tooltip: 'Hide Comments'
                }
            },
            delete : {
                icon : 'delete',
                isCounter : false,
                color : 'has-text-danger',
                tooltip: 'Delete',
            },
            follow : {
                icon: 'link',
                isCounter : false,
                tooltip: 'Follow Me',
                color : 'has-text-link',
            },
            unfollow : {
                icon: 'link_off',
                isCounter : false,
                color : 'has-text-danger',
            },
        } 
    }

    setDefault(){

        this.default = this.getDefault();

        for (let k in this.default){

            this.default[k].display = true;
            
            this.default[k].disabled = false;
            
            if (!this.default[k].hasOwnProperty('tooltip')) this.default[k].tooltip = this.capitalize(k);
            
            if (!this.default[k].hasOwnProperty('loading')) this.default[k].loading = false;
            
            if (!this.default[k].hasOwnProperty('callback')) this.default[k].callback = true;
            
            if (!this.default[k].hasOwnProperty('toggle')) this.default[k].toggle = false;

        }
    }

    appendAttributesItems(){

        for (let k in this.items){
            
            if (typeof this.items[k] === 'object'){

                for (let p in this.items[k]){

                    let append = {...this.default[p], ...this.items[k][p], name : p}

                    if (this.default[p] && this.default[p].isCounter) append = this.appendCount(append, p)

                    this.buttons.push(append)

                }

            } else {

                let append = {...this.default[this.items[k]], name: this.items[k]}

                if (this.default[this.items[k]] && this.default[this.items[k]].isCounter) append = this.appendCount(append, this.items[k]);

                this.buttons.push(append)

            }

            
        }

    }


    appendCount(append, p){

        //p = p.replace(/s$/, '')

        p = '_' + p + 's'
        
        var count = (this.counts.hasOwnProperty(p)) ? this.counts[p] : ((this.counts.hasOwnProperty(p + 's')) ? this.counts[p + 's'] : 0)
        
        return {...append, count : count}

    }

    capitalize(s){

        return s.replace(/^\w/, c => c.toUpperCase());
    }

    likeTrigger(){

        return new Promise((resolve,reject) => {         
            
            axios.post('/rest/like/'+ this.parentClass + '/' + this.parentId, { verb : 'like'}).then(response  =>  {
                
                resolve({counter : response.data.max});
            
            }, error  =>  {
                
                reject(error)
            
            })       
        });
    }

    dislikeTrigger(){

        return new Promise((resolve,reject) => {         
            
            axios.post('/rest/like/'+ this.parentClass + '/' + this.parentId, { verb : 'dislike'}).then(response  =>  {
                
                resolve({counter : response.data.max});
            
            }, error  =>  {
                
                reject(error)
            
            })       
        });
    
    }

    friendTrigger(){
        
        return new Promise((resolve,reject) => {         
            
            axios.post('/rest/friend/send/'+ this.parentId).then((response)  =>  {
                
                resolve(response.data.message);
            
            }, (error)  =>  {
                
                reject(error)
            
            })       
        });
    }

    deleteTrigger(){

        return new Promise((resolve,reject) => {         
            
            axios.post('/rest/delete/'+ this.parentClass + '/' + this.parentId).then(response  =>  {
                
                resolve({ message : response.data.message, delete : true });
            
            }, error  =>  {
                
                reject(error)
            
            })       
        });
    }

}


/*
class Buttons{
    
    constructor(buttons){

        this.buttons = [];
        this.type = type;
        this.object = object;

        this.stats = this.getStat();
        this.replies = this.stats.replies;
        this.comments = this.stats.comments;
        this.retweets = this.stats.retweets;

        this.hasGetReplyTrigger = false;

        this.size = (object.hasOwnProperty('sizeButtons') && object.sizeButtons > 0) ? object.sizeButtons : 1.1;
        this.color = (object.hasOwnProperty('colorButtonsClass') && object.colorButtonsClass.length > 0) ? 
                    object.colorButtonsClass : 'has-text-info';
        

        const _defaultTemplate = {

            like : {
                icon : 'thumb_up',
                isCounter : true,
                counter: this.stats.likes,
                hasLiked : false
            },
            dislike : {
                icon : 'thumb_down',
                isCounter : true,
                counter: this.stats.dislikes
            },
            retweet : {
                icon : 'share',
                isCounter : true,
                counter: this.stats.retweets
            },
            reply : {
                icon : 'reply',
                isCounter : false
            },
            friend : {
                icon : 'supervisor_account',
                isCounter : false,
                tooltip: {is:true, label: 'Send friend request'}
            },
            message : {
                icon : 'email',
                isCounter : false,
                tooltip: {is:true, label: 'Private message'}
            },
            getReply : {
                icon : null,
                minimalClass : false,
                colorClass: 'has-text-grey-dark',
                tooltip: {is:false, label:null},
                text: 'View Replies',
                textToggle: 'Hide Replies',
                counter: this.stats.replies
            },
            comment : {
                icon: 'comment',
                isCounter : true,
                counter: this.stats.comments
            },
            deleteButton : {
                icon : 'delete',
                isCounter : false,
                colorClass : 'has-text-warning',
                tooltip: {is:true, label: 'Delete'},
                display: object.isDelete
            },
            follow : {
                icon: 'link',
                isCounter : false,
                tooltip: {is:true, label: 'Follow me'},
                colorClass : 'has-text-link',
            },
            unfollow : {
                icon: 'link_off',
                isCounter : false,
                tooltip: {is:true, label: 'Unfollow'},
                colorClass : 'has-text-danger',
            },
        
        };

        let _default = this.computeDefault(_defaultTemplate);

        for (let k in buttons){

            var key = buttons[k];

            if (typeof key === 'string'){

                if (_default.hasOwnProperty(key)) {
                    
                    this.buttons.push(_default[key]);
                
                }
            }

            if (typeof key === 'object'){

                var _key = Object.keys(key)[0];

                if (_default.hasOwnProperty(_key)) {

                    for (let l in key[_key]){
                        _default[_key][l] = key[_key][l];
                    }

                    this.buttons.push(_default[_key]);
                
                }
            }

        }

        console.log('BUTTONS CLASS :::', this.buttons);
    }

    computeDefault(obj){

        for (let k in obj){

            obj[k].name = k;
            obj[k].size = this.size;
            if (!obj[k].hasOwnProperty('display')) obj[k].display = true;
            if (!obj[k].hasOwnProperty('colorClass')) obj[k].colorClass = this.color;
            if (!obj[k].hasOwnProperty('hasLiked')) obj[k].hasLiked = this.hasLiked;

        }

        return obj;
    }

    getStat(){
        let stats = {
            likes : 0,
            dislikes: 0,
            cooments: 0,
            replies : 0,
            retweets: 0,
        }

        if (!this.object.hasOwnProperty('stats') && !this.object.hasOwnProperty('statistics')) return stats;

        const _stats = (this.object.hasOwnProperty('statistics')) ? this.object.statistics : this.object.stats;

        for (let k in _stats){
            stats[k] = _stats[k];
        }

        console.error('STATS', this.object);

        return stats;
    }

    likeTrigger(){
        console.log(this.object);
        //console.log('type', this.object.type);
        //console.log('id', this.object.id);
        //return;

        return new Promise((resolve,reject) => {         
            axios.post('/rest/like/'+ this.object.type + '/' + this.object.id, { verb : 'like'}).then((response)  =>  {
                resolve({counter : response.data.max});
            }, (error)  =>  {
                reject(error)
            })       
        });
    }

    dislikeTrigger(){
        return new Promise((resolve,reject) => {         
            axios.post('/rest/like/'+ this.object.type + '/' + this.object.id, { verb : 'dislike'}).then((response)  =>  {
                resolve({counter : response.data.max});
            }, (error)  =>  {
                reject(error)
            })       
        });
    }

    getReplyTrigger(page = 1){
        return new Promise((resolve,reject) => {
            
            axios.get('/rest/comment/' + this.object.type + '/' + this.object.id + '?page=' + page)
                .then((response)  =>  {
                    resolve(response.data.comments);
            }, (error)  =>  {
                    reject(error);          
            });

        });
    }

    commentTrigger(page = 1){
        console.warn('TRIGGER COMMENT!!!!!');
        console.warn('TYPE',this.object.type);
        return this.getReplyTrigger(page);
    }


    friendTrigger(){
        return new Promise((resolve,reject) => {         
            axios.post('/rest/friend/send/'+ this.object.id).then((response)  =>  {
                resolve(response.data.message);
            }, (error)  =>  {
                reject(error)
            })       
        });
    }

}

export default Buttons
*/