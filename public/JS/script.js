let words = ["Inspire.", "Write.", "Connect.", "Grow."]

async function interval_1(){
    await new Promise((resolve, reject)=>{
        setInterval(() => {
           resolve(1) 
        }, 100);
    })
}
async function interval_2(){
    await new Promise((resolve, reject)=>{
        setInterval(() => {
           resolve(1) 
        }, 400);
    })
}

async function main(){
    const elem = document.querySelector(".lettering")
    while(true){
        for(let i = 0; i < 4; i++){
            let word = words[i]
            for (const e of word) {
                await interval_1()
                
                //adding the words to innerhtml
                
                elem.innerHTML = elem.innerHTML + e

            }
            await interval_2()
            //Deleting the words
            let del_word = elem.innerHTML
            // console.log(del_word)
            // console.log(typeof(del_word))
            while(del_word.length !== 0){
                elem.innerHTML = del_word.slice(0,-1)
                del_word = del_word.slice(0,-1)
                await interval_1()
            }
            await interval_2()
        }
    }
}
main()
