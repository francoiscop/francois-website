<template>
<div>
    <error :error="error" />

    <div class="editr">
        <div class="editr--toolbar">
            <Btn v-for="(module,i) in modules"
                :module="module"
                :options="mergedOptions"
                :key="module.title + i"

                :is-disabled="module.hasSelection && isDisabled"

                :ref="'btn-'+module.title"
                :title="module.description || ''"
            ></Btn>
        </div>
        <div class="editr--content" ref="content" contenteditable="true" tabindex="1" :placeholder="placeholder">
        </div>
    </div>
    <div class="button m-t-5" :class="{'is-loading' : isPostLoading}" :disabled="postDisabled" @click="post">POST</div>

</div>
</template>

<script>
import {mixError} from '../social/mixins/mixError.js';

import bus from './bus.js';
import debounce from "debounce";
import Btn from "./Button.vue";

import bold from "./modules/bold.js";
import italic from "./modules/italic.js";
import underline from "./modules/underline.js";
import alignLeft from "./modules/alignLeft.js"
import alignCenter from "./modules/alignCenter.js"
import alignRight from "./modules/alignRight.js"
import headings from "./modules/headings.vue";
import hyperlink from "./modules/hyperlink.vue";
import code from "./modules/code.js";
import list_ordered from "./modules/list_ordered.js";
import list_unordered from "./modules/list_unordered.js";
import image from "./modules/image.vue";
import imageInsert from "./modules/imageInsert.vue";
import table from "./modules/table.vue";
import removeFormat from "./modules/removeFormat.js";
import separator from "./modules/separator.js";
import color from "./modules/color.vue";


const modulesx = [
    bold, italic, underline, separator,
    alignLeft, alignCenter, alignRight, separator,
    headings, hyperlink, code,
    list_ordered, list_unordered, separator, image, table, separator,
    removeFormat, color
];

const modules = [bold, italic, headings, alignLeft, alignCenter, alignRight, hyperlink, color, imageInsert]

export default{

    model: {
        prop: "html",
        event: "html"
    },

    mixins: [mixError],

    props:{

         html: {
            type: String,
            default: ""
        },
        placeholder: {
            type: String,
            default: "Enter text..."
        },

        options: Object,

        parentId:{
            typeof: Number,
            default: null
        }
    },

    components: { Btn  },

    data () {
        return {
            selection: "",
            isDisabled: true,
            postDisabled: true,
            isPostLoading: false
            //images: []
        }
    },

    computed: {

        url(){
            return '/rest/post/' + this.parentId
        },

        mergedOptions () {
          return { ...bus.options, ...this.options}
        },

        modules () {
            const customIcons = this.mergedOptions.iconOverrides;

            return modules

            return modules
            .filter(
                m => this.mergedOptions.hideModules === undefined
                || !this.mergedOptions.hideModules[m.title]
            )
            .map(mod => {
              if (customIcons !== undefined && customIcons[mod.title] !== undefined) {
                mod.icon = customIcons[mod.title];
              }
              return mod;
            })
            .concat(this.mergedOptions.customModules);
        },

        btnsWithDashboards  () {
            if (this.modules)
                return this.modules.filter(m => m.render);
            return [];
        },

        innerHTML: {
            get () {
                return this.$refs.content.innerHTML;
            },

            set (html) {
                if (this.$refs.content.innerHTML !== html) {
                    this.$refs.content.innerHTML = html;
                }
            }
        }
    },

    methods: {

        saveSelection() {

            if (window.getSelection !== undefined) {
                
                this.selection = window.getSelection();

                if (this.selection.getRangeAt && this.selection.rangeCount) {

                    return this.selection.getRangeAt(0);
                
                }

            } else if (document.selection && document.selection.createRange) {

                return document.selection.createRange();
            }

            return null;
        },

        restoreSelection(range) {
            if (range) {
                if (window.getSelection !== undefined) {
                    this.selection = window.getSelection();
                    this.selection.removeAllRanges();
                    this.selection.addRange(range);
                }
                else if (document.selection && range.select)
                    range.select();
            }
        },

        clearSelection() {
        
            window.sel = '';
            this.selection = null;
            const selection = window.getSelection();

            if (selection) {
                if (selection.empty !== undefined) {
                    selection.empty();
                }
                
                if (selection.removeAllRanges !== undefined) {
                    selection.removeAllRanges();
                }
            }
        },

        exec (cmd, title, arg, sel){

            this.$refs.content.focus();

            if (cmd === 'insertHTMLimage') this.insertHTMLimage(arg);
            
            else document.execCommand(cmd, false, arg||"");

            //this.clearSelection();

            return
            
            var selection = document.getSelection();

            if (title !== null && selection == '' && this.selection == ''){

                console.error('NO SELECTION');

                return;
            }

            if (title !== '' && typeof this.$refs[title] !== 'undefined'){

                for (let k in this.$refs){
                    console.log(k)
                    //console.log(this.$refs[k][0].resetToggle())
                    if (k !== title && typeof this.$refs[k][0] !== 'undefined') this.$refs[k][0].resetToggle();
                }

                this.$refs[title][0].toggle();

            }
   
            document.execCommand(cmd, false, arg||"");

            this.$nextTick(this.emit);

            return
        },

        onDocumentClick (e) {
            
            for (let i = 0; i < this.btnsWithDashboards.length; i++) {
                const btn = this.$refs[`btn-${this.btnsWithDashboards[i].title}`][0];
                if (btn && btn.showDashboard && !btn.$el.contains(e.target))
                    btn.closeDashboard();
            }
        },

        emit () {
            
          this.$emit("html", this.$refs.content.innerHTML);
          this.$emit("change", this.$refs.content.innerHTML);
        },

        onInput: debounce(function() {
            
            if (this.getSelectedText() === '') this.isDisabled = true;

            if (this.getTextContent().length > 10) this.postDisabled = false;
            else this.postDisabled = true;

            this.emit();
        
        }, 300),

        onFocus () {

            document.execCommand("defaultParagraphSeparator", false, this.mergedOptions.paragraphSeparator)
        },

        onContentBlur () {
            this.selection = this.saveSelection();
            window.sel = this.selection.toString()
        },

        onPaste(e) {
            e.preventDefault();

             // get a plain representation of the clipboard
            var text = e.clipboardData.getData("text/plain");

            // insert that plain text text manually
            document.execCommand("insertHTML", false, text);
        },

        onSelect(){
            var selected = this.getSelectedText()
            if (selected !== '') this.isDisabled = false;
            else this.isDisabled = true;
        },

        syncHTML () {
        
            if (this.html !== this.$refs.content.innerHTML) this.innerHTML = this.html;
        },

        getTextContent(){

            var content = this.$refs.content;

            return content.textContent || content.innerText || "";

        },

        post(){

            var content = this.$refs.content;

            var clone = content.cloneNode(true);

            var images = clone.getElementsByClassName('content__image-wrapper')

            for (let i = 0; i < images.length; i++) {

                while (images[i].hasChildNodes()) images[i].removeChild(images[i].firstChild);
            }

            var send = clone.innerHTML;



            var formData = new FormData();

            formData.append('content', send);
          
            for (var key in bus.images){
                
                formData.append('images[]', bus.images[key]);
            
            }

            this.$store.dispatch('feeds/postItem', formData).then((r) => {

                this.isPostLoading = false

                this.reset();

                this.setSuccess('Posted')

            }).catch(e => {

                this.isPostLoading = false

                this.setError(e)

            })
        },

        reset(){

            this.$refs.content.innerHTML = '';

        },

        getSelectedText() {

            var text = null;

            if (typeof window.getSelection != "undefined") {

                text = window.getSelection().toString();

            } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {

                text = document.selection.createRange().text;
            }

            return text
        },

        getSelectedText_2() {

            if (window.getSelection) return window.getSelection().toString();

            if (document.selection) return document.selection.createRange().text;

            return
        },

        insertHTMLimage(arg) {

            this.$refs.content.contentEditable = false;

            var sel, range;

            if (window.getSelection && (sel = window.getSelection()).rangeCount) {

                range = sel.getRangeAt(0);
                range.collapse(true);
                var div = document.createElement("span");
                div.id = "myId";
                div.classList.add("content__image-wrapper");
                div.appendChild( document.createTextNode("TESTxxxx") );
        
                var suffixNode = document.createTextNode(' t');

                console.log(div.parentNode)
                //div.insertBefore(suffixNode, div.nextSibling);

                range.insertNode((suffixNode));
                range.insertNode(div);

                setTimeout(()=>{

                    range.setStartAfter(suffixNode);
                    this.$refs.content.contentEditable = true;

                },1000)
   
                //Move the caret immediately after the inserted span
                //range.setStartAfter(div);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },

        pasteHtmlAtCaret(html, selectPastedContent) {
    
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Range.createContextualFragment() would be useful here but is
                    // only relatively recently standardized and is not supported in
                    // some browsers (IE9, for one)
                    var el = document.createElement("div");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ( (node = el.firstChild) ) {
                        lastNode = frag.appendChild(node);
                    }
                    var firstNode = frag.firstChild;
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        if (selectPastedContent) {
                            range.setStartBefore(firstNode);
                        } else {
                            range.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if ( (sel = document.selection) && sel.type != "Control") {
                // IE < 9
                var originalRange = sel.createRange();
                originalRange.collapse(true);
                sel.createRange().pasteHTML(html);
                if (selectPastedContent) {
                    range = sel.createRange();
                    range.setEndPoint("StartToStart", originalRange);
                    range.select();
                }
            }
        },
    },

    mounted () {
        this.unwatch = this.$watch("html", this.syncHTML, { immediate: true});

        document.addEventListener("click", this.onDocumentClick);

        this.$refs.content.addEventListener("focus", this.onFocus);
        this.$refs.content.addEventListener("input", this.onInput);
        this.$refs.content.addEventListener("blur", this.onContentBlur, { capture: true });

        this.$refs.content.addEventListener("mouseup", this.onSelect);

        if (this.mergedOptions.forcePlainTextOnPaste === true) {
            this.$refs.content.addEventListener("paste", this.onPaste);
        }
        
        this.$refs.content.style.maxHeight = this.mergedOptions.maxHeight;
    },

    beforeDestroy () {
      this.unwatch();
      document.removeEventListener("click", this.onDocumentClick);

      this.$refs.content.removeEventListener("blur", this.onContentBlur);
      this.$refs.content.removeEventListener("input", this.onInput);
      this.$refs.content.removeEventListener("focus", this.onFocus);
    },

}
</script>

