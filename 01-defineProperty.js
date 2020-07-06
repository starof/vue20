//1,数据响应式
//数据响应式，感知数据变化，数据变化之后让视图刷新
//做到数据响应式，数据变化就可以感知，通知视图去做重新渲染和更新
//vue2.x拦截属性的set，get从而做到响应
//2,数据发生变化之后我怎么知道我要去改谁？
//编译器把模板语法解析成更新函数去执行。

//1. Object.defineProperty()
function defineReactive(obj,key,val){
    //val可能是对象，就需要递归处理
    observe(val)
    Object.defineProperty(obj,key,{
        get(){
            console.log('get',val);
            return val;
        },
        set(newVal){ //在这里通知更新页面
            if(newVal!=val){
                console.log('set',newVal);
                //newVal可能是一个全新的对象
                observe(newVal)
                val = newVal
                
            }
        }
    })
}


//对象响应式处理

function observe(obj){
    //判断obj类型必须是对象
    if(typeof obj != 'object' || obj==null){
        return;
    }
    Object.keys(obj).forEach(key=>{
        defineReactive(obj,key,obj[key])
    })
}


//让属性转正，让新属性能够被拦截到
function set(obj, key, val){
    defineReactive(obj,key,val)
}










const obj={foo:'foo',bar:'bar',baz:{a:1}}

// defineReactive(obj,'foo','foo')

observe(obj)

// obj.foo
// // obj.set('fooooooo')//obj.set is not a function
// obj.foo='fooooooooooo'

// obj.bar

// obj.baz.a=10

//用户直接替换对象，国家队没有受过社会主义教育
// obj.baz={a:10}
// obj.baz.a = 100

// obj.dong='dong' //不能这么写，得用提供的动态的set方法
set(obj,'dong','dong')
obj.dong


//设置数组的时候，改了数组的原型，让它的行为变的可拦截