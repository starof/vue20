//1,数据响应式
//数据响应式，感知数据变化，数据变化之后让视图刷新
//做到数据响应式，数据变化就可以感知，通知视图去做重新渲染和更新
//vue2.x拦截属性的set，get从而做到响应
//2,数据发生变化之后我怎么知道我要去改谁？
//编译器把模板语法解析成更新函数去执行。

//1. Object.defineProperty()
function defineReactive(obj,key,val){
    Object.defineProperty(obj,key,{
        get(){
            console.log('get',val);
            return val;
        },
        set(newVal){ //在这里通知更新页面
            if(newVal!=val){
                console.log('set',newVal);
                val = newVal;
            }
        }
    })
}

const obj={}

defineReactive(obj,'foo','foo')

obj.foo
// obj.set('fooooooo')//obj.set is not a function
obj.foo='fooooooooooo'