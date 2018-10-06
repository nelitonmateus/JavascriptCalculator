class CalcController{

    constructor(){

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");

        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    initKeyboard(){

        document.addEventListener('keyup', e=>{
            this.playAudio();
            switch (e.key){
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot('.');
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }

    initialize(){

        this.setDisplayDateTime();
        //Toda vez que eu crio um setInterval() o meu navegador cria um ID pra esse setInterval
        //então se for preciso parar este setInterval, é preciso pegar o ID do mesmo!!, por isso declaramos a variavel pro set interval!
        let interval = setInterval(()=>{
            this.setDisplayDateTime();
        },1000);
        
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{
            
            btn.addEventListener('dblclick',e=>{

                this.toggleAudio();
                
            });
        });

    }

    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index)=>{
            this.addEventListenerAll(btn,"click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-","");

                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=>{
                btn.style.cursor = "pointer";
            });

        });

    }

    //Methods

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;

    }

    playAudio(){

        if(this._audioOnOff){

            this._audio.currentTime = 0;
            this._audio.play();

        } 

    }

    copyToClipboard(){

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    pasteFromClipboard(){

        document.addEventListener('paste', e=>{
            this.displayCalc = parseFloat(e.clipboardData.getData('Text'));            
        });

    }

    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event=>{
            element.addEventListener(event,fn,false);
        });
    }

    execBtn(value){
        this.playAudio();
        switch (value){
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot('.');
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }
    
    addOperation(value){
        if(isNaN(this.getLastOperation())){
            
            if(this.isOperator(value)){
            
                this.setLastOperation(value);
            
            }else{

                this.pushOperation(value); 
                this.setLastNumberToDisplay();

            }
            
        }else{
            
            if(this.isOperator(value)){
            
                this.pushOperation(value); 
            
            }else{
            
                
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);                 
                this.setLastNumberToDisplay();
            
            }
        }

    }

    addDot(){

        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation){

            this.pushOperation('0.');

        }else{

            this.setLastOperation(lastOperation.toString() + '.');

        }

        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true){
        
        let lastItem;

        for(let i = this._operation.length-1; i>=0; i--){

            if(this.isOperator(this._operation[i]) == isOperator)   {
                lastItem = this._operation[i];
                break;
            }
          
        }

        if(!lastItem){

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;

    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    isOperator(value){
       return ['+','-','*','%','/'].indexOf(value) > -1; 
    }

    getLastOperation(){

        return this._operation[this._operation.length - 1];

    }

    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
    }

    setError(){
        this.displayCalc = 'Error';
    }
    
    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day : '2-digit',
            month : 'long',
            year : 'numeric'
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    pushOperation(value){
        this._operation.push(value); 

        if(this._operation.length > 3){
            this.calc();
        }
    }
    
    getResult(){

        try {
            
            return eval(this._operation.join(''));   
        
        } catch (e) {
            
            setTimeout(()=>{
            
                this.setError();
            
            },1);

        }

    }

    calc(){
        
        let lastOperation = '';

        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem,this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            lastOperation = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3){
            this._lastNumber = this.getLastItem(false);
        }

        console.log('_lastOperator' + this._lastOperator);
        console.log('_lastNumber' + this._lastNumber);

        let result = this.getResult();

        if (lastOperation == '%'){

            result /= 100;

        }
        
        this._operation = [result];
        
        if(lastOperation) this._operation.push(lastOperation);

        this.setLastNumberToDisplay();

    }

    //Getters and Setters

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        if(value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}