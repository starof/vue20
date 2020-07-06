/* new Vue()的时候，做两件事，
1，把用户传入的data中的属性做一次拦截，劫持监听所有属性。Observer做响应式处理
2，编译，更新函数，解析界面中的语法变成update()更新函数。。第一次编译之后视图中就能看到值了

需要一些新的角色的出现，让这些动态的数据和界面中编译得到的绑定的数据给它连起来
Watcher:观察Key,它知道和它相关的更新函数。负责执行更新函数。界面中可能出现很多很多watcher
Dep:大管家，内部维护一个数组，管理watcher。Dep和Observer中在做遍历的每一个key是一一对应的关系。
名词解释：
LVue:框架构造函数
Observer:执行数据响应化（分辨数据是对象还是数组）
Compile:编译模板，初始化视图，手机依赖（更新函数，watcher创建）
Watcher:执行更新函数（更新dom）
Dep:管理多个Watcher，批量更新

*/


//1. Object.defineProperty()
function defineReactive(obj,key,val){
    //val可能是对象，就需要递归处理
    observe(val)

    //依赖收集的时候，每执行一次defineReactive就会创建一个Dep实例
    const dep = new Dep()

    Object.defineProperty(obj,key,{
        get(){
            console.log('get',val);
            //依赖收集
            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set(newVal){ //在这里通知更新页面
            if(newVal!=val){
                console.log('set',newVal);
                //newVal可能是一个全新的对象
                observe(newVal)
                val = newVal
                
                //通知更新
                // watchers.forEach(w=>w.update()) //简单粗暴
                dep.notify()
            }
        }
    })
}



//拦截 
//每一次给数据做响应式处理的时候就生成一个Observer实例
function observe(obj){
    //判断obj类型必须是对象
    if(typeof obj != 'object' || obj==null){
        return;
    }

    new Observer(obj);

}

//将$data中的key代理到LVue的实例上
function proxyFun(vm){
    Object.keys(vm.$data).forEach(key=>{
        Object.defineProperty(vm,key,{
            get(){
                return vm.$data[key]
            },
            set(v){
                //设置set
                vm.$data[key]=v
            }
        })
    })
}


class LVue{

    constructor(options){
        //保存选项
        this.$options= options
        this.$data = options.data  //$data存起来是干什么用的？ app.$data.counter++

        //响应化处理,data是响应式的
        observe(this.$data)

        console.log("执行了proxy1")
        //代理
        proxyFun(this)

        //编译器
        new Compile("#app",this)
    }
}


//每一个响应式对象就伴生一个Observer实例
//唯一的作用obj根据类型做不同的操作
class Observer{
    constructor(value){
        this.value = value;
        //判断value是obj还是数组
        walk(value)
    }

}

function walk(obj){
    Object.keys(obj).forEach(key=>{
        defineReactive(obj,key,obj[key])
    })
}

//编译过程

//new Compile(el,vm)
class Compile{
    constructor(el,vm){
        this.$vm=vm;
        this.$el = document.querySelector(el)

        //编译模板
        if(this.$el){
            this.compile(this.$el);
        }
    }

    compile(el){
        //递归遍历el
        
        el.childNodes.forEach(node=>{
            //判断其类型
            if(this.isElement(node)){
                console.log('编译元素',node.nodeName)
                this.compileElement(node)
            }else if(this.isinter(node)){
                console.log('编译插值表达式',node.textContent)
                this.compileText(node)
            }

            if(node.childNodes){
                this.compile(node)
            }
        })
    }
    

    //插值文本的编译
    compileText(node){
        //获取匹配表达式
        // node.textContent = this.$vm[RegExp.$1]
        this.update(node,RegExp.$1,'text')
    }

    //编译节点
    compileElement(node){
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr=>{
            //l-xxx = "exp"
            const attrName = attr.name //l-xxx
            const exp = attr.value //aaa
            //判断这个属性类型
            // if(this.isDirective(attrName)){
            if (attrName.indexOf('l-') === 0) {
                const dir = attrName.substring(2)
                //执行指令
                this[dir] && this[dir](node,exp)
            }
        })
    }

    //文本指令 //l-text
    text(node,exp){
        // node.textContent = this.$vm[exp]
        this.update(node,exp,'text')
    }

     //html指令 //l-html
    html(node,exp){
        // node.innerHTML = this.$vm[exp]
        this.update(node,exp,'html')
    }

    //公用函数，让更新去用
    //所有动态的绑定都需要创建更新函数以及对应的watcher实例
    update(node,exp,dir){
        //textUpdater(),htmlUpdater()
        //初始化
        const fn = this[dir+'Updater'];
        fn&&fn(node,this.$vm[exp])

        //更新，值是Watcher里传的
        new Watcher(this.$vm, exp, function(val){
            fn&&fn(node,val)
        })
    }

    htmlUpdater(node,value){
        node.innerHTML = value
    }

    textUpdater(node,value){
        node.textContent = value
    }

    //元素
    isElement(node){
        return node.nodeType === 1
    }

    //判断是否是插值表达式{{xx}}}
    isinter(node){
        return node.nodeType===3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}


//Watcher:小秘书，界面中的一个依赖对应一个小秘书
// const watchers = []

class Watcher{
    constructor(vm,key,updateFn){
        this.vm = vm;
        this.key = key;
        this.updateFn = updateFn;

        // watchers.push(this)//实例放到watcers里面
        //读一次数据，触发defineReactive里面的get()
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
    }

    //管家调用 //未来会被dep调用
    update(){
        //传入当前的最新值给更新函数
        this.updateFn.call(this.vm,this.vm[this.key])
    }
}

class Dep{

    constructor(){
        this.deps = []

    }

    //依赖收集到dep
    addDep(watcher){
        this.deps.push(watcher)
    }

    //set的时候通知更新
    notify(){
        this.deps.forEach(dep=>dep.update())
    }


}