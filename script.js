class App {
	constructor(r){

		// 서명
		this.drawed = false;
		this.drawing = false;
		this.prevX = null;
		this.prevY = null;
		this.signStatus = true;

		this.fundlist = [];
		this.highlist = [];
		this.invlist = [];

		r.forEach((x)=>{
			this.fundlist.push(new Fund(x.number, x.name, x.total, x.current, x.endDate, x.investorList));
			this.highlist.push(new Fund(x.number, x.name, x.total, x.current, x.endDate, x.investorList));
			x.investorList.forEach((e)=>{
				this.invlist.push(new Investor(x.number, x.name, x.total, x.current, x.endDate, e.email, e.pay, e.datetime));
			});
		});
		console.log(this.invlist);

		let clicking = document.getElementsByClassName("click")[0].innerHTML;
		if(clicking == "메인페이지"){
			this.mainLoader();
		}else if(clicking == "펀드등록"){
			this.adaptLoader();
		}else if(clicking == "펀드보기"){
			this.fundLoader();
		}else if(clicking == "투자자목록"){
			this.investorLoader();
		// }else if(clicking == "회원가입"){
			this.registerLoader();
		}
	}

	toast(msg){
		let back = document.querySelector("#toast-back");
		let div = document.createElement("div");
		div.classList.add("toast");
		div.innerHTML = `
			<span class="toast-close">&times;</span>
			<p>${msg}</p>
		`;
		$(back).prepend(div);
		div.querySelector(".toast-close").addEventListener("click", ()=>{
			this.remove(div);
		});
		setTimeout(()=>{
			this.remove(div);
		}, 3000)
	}

	check(v, l) {
		if(v.length >= l){
			v = v.substring(0, l -1);
			v += "...";
		}
		return v;
	}

	remove(e){
		e.parentNode.removeChild(e);
	}

	mainLoader(){
		this.highlist = this.highlist.sort((a,b)=> (b.current / b.total) - (a.current / a.total));
		this.highlist = this.highlist.filter(x => new Date(x.endDate) > new Date());
		console.log(this.highlist);
		
		let form = document.querySelector(".ranking-form");
		for(let i = 0; i < 4; i++){
			let div = document.createElement("div");
			div.classList.add("ranking");
			div.innerHTML = this.rankingTemp(this.highlist[i]);
			let canvas = div.querySelector("canvas");
			this.makeGraph(canvas, this.highlist[i]);
			form.append(div);
			div.querySelector(".go-look").addEventListener("click", ()=>{
				this.makePopup(this.highlist[i]);
			});
		}
	}

	makePopup(x){
		let back = document.createElement("div");
		back.classList.add("back");
		back.innerHTML = this.popupTemp(x);
		document.querySelector("body").append(back);
		back.querySelector(".pop").addEventListener("click", ()=>{
			this.remove(back);
		});
		back.querySelector(".popup-close").addEventListener("click", ()=>{
			this.remove(back);
		});
		let invform = back.querySelector(".up-inv-form");
		x.investorList.forEach((e)=>{
			let div = document.createElement("div");
			div.classList.add("up-inv");
			div.innerHTML = `<div>${e.email}</div><div>${e.pay}</div>`;
			invform.append(div);
		});
	}

	makeFundup(x) {
		this.drawed = false;
		this.drawing = false;
		let back = document.createElement("div");
		back.classList.add("back");
		back.innerHTML = this.fundupTemp(x);
		document.querySelector("body").append(back);
		$(".pop").on("click", ()=>{
			this.remove(back);
		});
		$(".popup-close").on("click", ()=>{
			this.remove(back);
		});
		$(".fundup-cancel").on("click", ()=>{
			this.remove(back);
		})
		$("canvas").on("mousedown", (e)=>{
			this.prevX = e.offsetX;
			this.prevY = e.offsetY;
			this.drawing = true;
		});
		$("canvas").on("mousemove", (e)=>{
			if(this.drawing == true){
				this.drawSign(e.target, e.offsetX, e.offsetY, this.signStatus);
				this.prevX = e.offsetX;
				this.prevY = e.offsetY;
				this.drawed = true;
			}
		});
		$("canvas").on("mouseup", (e)=>{
			this.drawing = false;
		});
		$(".sign-thin").on("click", (e)=>{
			this.signStatus = true;
		});
		$(".sign-bold").on("click", (e)=>{
			this.signStatus = false;
		});
		$(".fundup-email").on("focusout", (e)=>{
			this.checkWord(e.target, "투자자명이");
		});
		$(".fundup-pay").on("focusout", (e)=>{
			this.checkPay(e.target);
		});
		$(".fundup-done").on("click",(e)=>{
			let ep = e.target.parentNode.parentNode;
			let email = ep.querySelector(".fundup-email");
			let pay = ep.querySelector(".fundup-pay");
			let canvas = ep.querySelector("canvas");
			this.checkWord(email, "투자자명이");
			this.checkPay(pay, "투자금액이");
			this.checkCanvas(canvas, "서명란이");
			let warning = ep.getElementsByClassName("warning");
			if(warning.length == 0){
				this.toast("해당펀드에 성공적으로 투자하였습니다.");
				this.remove(ep.parentNode);
			}
		})
	}
	checkCanvas(e, v){
		if(this.drawed == false){
			this.toast(v+" 비워져있습니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}
	checkPay(e){
		this.checkNum(e, "투자금액이");
		if($(e).hasClass("warning") == true){
			return;
		}
		if(e.value > e.total){
			this.toast("입력하신 금액이 해당펀드의 총 모집금액을 초과하였습니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}

	checkNum(e, v){
		this.checkNull(e,v);
		if($(e).hasClass("warning") == true){
			return;
		}
		let regex = /^[0-9]+$/;
		if(e.value.match(regex) == null || parseInt(e.value) - e.value != 0){
			this.toast(v+ "잘못된 값입니다. (0보다큰 정수만 입력가능합니다)");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}

	checkNull(e,v){
		if(e.value == "" || e.value == null || e.value === undefined){
			this.toast(v + " 비워져있습니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}
	checkWord(e, v){
		this.checkNull(e, v);
		if($(e).hasClass("warning") == true){
			return;
		}
		let regex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣 ]+$/;
		if(e.value.match(regex) == null){
			this.toast(v + "잘못된 값입니다. 한글,영문,띄어쓰기만 입력가능합니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}
	drawSign(canvas, x, y, s){
		let ctx = canvas.getContext("2d");
		if(s == true){
			ctx.lineWidth = 1;
		}else {
			ctx.lineWidth = 3;
		}
		ctx.beginPath();
		ctx.strokeStyle = "#000";
		ctx.moveTo(this.prevX, this.prevY);
		ctx.lineTo(x,y);
		ctx.stroke();
		ctx.closePath();
	}

	popupTemp(x){
		let total = parseInt(x.total).toLocaleString();
		let current = parseInt(x.current).toLocaleString();
		let temp = `
			<div class="pop"></div>
			<div class="up">
				<span class="popup-close">&times;</span>
				<div class="up-box">
					<div class="up-left">펀드번호</div>
					<span>${x.number}</span>
				</div>
				<div class="up-box">
					<div class="up-left">창업펀드명</div>
					<span>${x.name}</span>
				</div>
				<div class="up-box">
					<div class="up-left">모집마감일</div>
					<span>${x.endDate}</span>
				</div>
				<div class="up-box">
					<div class="up-left">모집금액</div>
					<span>${total}원</span>
				</div>
				<div class="up-box">
					<div class="up-left">현재금액</div>
					<span>${current}원</span>
				</div>
				<div class="up-inv-title">
					<h3>투자자목록</h3>
					<div class="line50"></div>
				</div>
				<div class="up-inv-middle">
					<div>이름</div>
					<div>투자금액</div>
				</div>
				<div class="up-inv-form">

				</div>
			</div>
		`
		return temp;
	}

	fundupTemp(x) {
		let temp = `
			<div class="pop"></div>
			<div class="up">
				<span class="popup-close">&times;</span>
				<div class="up-box">
					<div class="up-left">펀드번호</div>
					<span>${x.number}</span>
				</div>
				<div class="up-box">
					<div class="up-left">창업펀드명</div>
					<span>${x.name}</span>
				</div>
				<div class="up-box">
					<div class="up-left">투자자명</div>
					<input type="text" value="홍길동" readonly class="fundup-email" />
				</div>
				<div class="up-box">
					<div class="up-left">투자금액</div>
					<input type="number" class="fundup-pay" />
				</div>
				<div class="up-box">
					<div class="up-left">서명란</div>
					<div class="up-right">
						<canvas width="250" height="100"></canvas>
						<div class="up-right-btn">
							<button class="sign-thin">얇게</button>
							<button class="sign-bold">굵게</button>
						</div>
					</div>
				</div>
				<div class="up-btns">
					<button class="fundup-done">투자</button>
					<button class="fundup-cancel">취소</button>
				</div>
			</div>
		`;
		return temp;
	}

	rankingTemp(x) {
		let name = this.check(x.name, 12);
		let current = parseInt(x.current).toLocaleString();
		let temp = `
			<canvas width="250" height="200"></canvas>
			<h3>${x.number}</h3>
			<h2>${name}</h2>
			<div class="ranking-div">
				<div class="ranking-left">달성율</div>
				<span>${x.current / x.total * 100}%</span>
			</div>
			<div class="ranking-div">
				<div class="ranking-left">모집마감일</div>
				<span>${x.endDate}</span>	
			</div>
			<div class="ranking-div">
				<div class="ranking-left">현재금액</div>
				<span>${current}원</span>
			</div>
			<button class="go-look">상세보기</button>
		`
		return temp;
	}

	makeGraph(canvas, x) {
		let w = canvas.width;
		let h = canvas.height;
		let ctx = canvas.getContext("2d");
		let now = 0;
		let term = x.current / 45;

		let frame = setInterval(()=>{
			now += term;
			if(now >= x.current){
				now = x.current;
				clearInterval(frame);
			}
			this.drawGraph(ctx, w, h, now, x.total);
		}, 1000/30);
	}

	drawGraph(ctx, w, h, now, total) {
		ctx.clearRect(0,0,w,h);

		ctx.beginPath();
		ctx.fillStyle = "#bddff0";
		ctx.moveTo(w/2, h/2);
		ctx.arc(w/2, h/2, 90, -Math.PI/2, 3/2*Math.PI);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = "#2292d1";
		ctx.moveTo(w/2, h/2);
		ctx.arc(w/2, h/2, 90, -Math.PI/2, -Math.PI/2 + (now / total) * ( 2* Math.PI));
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.moveTo(w/2, h/2);
		ctx.arc(w/2, h/2, 60, -Math.PI/2, 3/2*Math.PI);
		ctx.fill();
		ctx.closePath();

		let percnet = Math.floor(now / total * 100);
		ctx.fillStyle = "#002758";
		ctx.font = "25px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(percnet + "%", w/2, h/2);
	}

	makeLine(canvas, x){
		let w = canvas.width;
		let h = canvas.height;
		let ctx = canvas.getContext("2d");
		let now = 0;
		let term = x.pay / 45;

		let frame = setInterval(()=>{
			now += term;
			if(now >= x.pay){
				now = x.pay;
				clearInterval(frame);
			}
			this.drawLine(ctx, w, h, now, x.total);
		},1000/30)
	}

	drawLine(ctx, w, h, now, total) {
		ctx.clearRect(0, 0, w, h);

		ctx.fillStyle = "#bddff0";
		ctx.fillRect(0,0,w,h);

		ctx.fillStyle = "#2292d1";
		ctx.fillRect(0,0,w * (now / total), h);
	}

	adaptLoader(){
		let num = "000" + (this.fundlist.length +1);
		num = num.substring(num.length, num.length-4);
		num = "A" + num;
		document.querySelector(".adapt-number").value = num;

		$(".adapt-name").on("focusout",(e)=>{
			this.checkWord(e.target, "창업펀드명이");
		});
		$(".adapt-total").on("focusout", (e)=>{
			this.checkNum(e.target, "모집금액이");
		});
		$(".adapt-endDate").on("focusout", (e)=>{
			this.checkDate(e.target, "모집마감일이");
		});
		$("#adapt-sub").on("focusout", (e)=>{
			this.checkSub(e.target, "상세설명이");
		});
		$(".adapt-file").on("change", (e)=>{
			this.checkFile(e.target);
		});

		$(".adapt-done").on("click", (e)=>{
			let ep = e.target.parentNode;
			let name = ep.querySelector(".adapt-name");
			let total = ep.querySelector(".adapt-total");
			let endDate = ep.querySelector(".adapt-endDate");
			let sub = ep.querySelector("#adapt-sub");
			let file = ep.querySelector(".adapt-file");
			this.checkWord(name, "창업펀드명이");
			this.checkNum(total, "모집금액이");
			this.checkDate(endDate, "모집마감일이");
			this.checkSub(sub, "상세설명이");
			this.checkNull(file, "펀드이미지가 ");
			let warning = ep.getElementsByClassName("warning");
			if(warning.length == 0){
				this.toast("펀드가 성공적으로 등록되었습니다.");
			}
		})
	}

	checkFile(e) {
		let type = e.files[0].type;
		type = type.split("/")[1];
		let size = e.files[0].size;
		size = size / (1024*1024);
		if(type != "jpeg" && type != "jpg" && type != "png"){
			this.toast("파일 형식이 올바르지 않습니다. (jpg, png파일만 가능합니다.)");
			e.classList.add("warning");
		}else if(size > 5){
			this.toast("파일은 5Mbyte 이하만 업로드 가능합니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}

	checkSub(e,v){
		this.checkNull(e,v);
		if($(e).hasClass("warning") == true){
			return;
		}
		if(e.value.length > 500){
			this.toast("상세설명이 500자를 초과하였습니다. 500자 이내로 써주십시오.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}

	checkDate(e,v) {
		this.checkNull(e, v);
		if($(e).hasClass("warning") == true){
			return;
		}
		if(new Date(e.value) < new Date()){
			this.toast("모집마감일의 값이 올바르지 않습니다. 현재보다 이전의 날짜는 선택하실 수 없습니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}

	fundLoader() {
		let form = document.querySelector(".fund-form");

		this.fundlist.forEach((x)=>{
			let div = document.createElement("div");
			div.classList.add("fund");
			div.innerHTML = this.fundlistTemp(x);
			form.append(div);
			let canvas = div.querySelector("canvas");
			this.makeGraph(canvas, x);
			div.querySelector(".fund-look").addEventListener("click", ()=>{
				this.makePopup(x);
			});
			if(new Date(x.endDate) < new Date()){
				div.querySelector(".fund-status").innerHTML = "모집완료";
			}
			div.querySelector(".fund-go").addEventListener("click", ()=>{
				this.makeFundup(x);
			})
		});
	}

	fundlistTemp(x) {
		let total = parseInt(x.total).toLocaleString();
		let current = parseInt(x.current).toLocaleString();
		let temp = `
			<div class="fund-title">
				<h3>${x.number}</h3>
				<h2>${x.name}</h2>
				<div class="fund-status">모집중</div>
			</div>
			<div class="fund-middle">
				<canvas width="220" height="220"></canvas>
				<div class="fund-notice">
					<div>
						<h3>모집마감일</h3>
						<div class="line50"></div>
						<p>${x.endDate}</p>
					</div>
					<div>
						<h3>모집금액</h3>
						<div class="line50"></div>
						<p>${total}원</p>
					</div>
					<div>
						<h3>현재금액</h3>
						<div class="line50"></div>
						<p>${current}원</p>
					</div>
				</div>
			</div>
			<div class="fund-btns">
				<button class="fund-go">투자하기</button>
				<button class="fund-look">상세보기</button>
			</div>
		`;

		return temp;
	}

	investorLoader() {
		for(let i = 0; i < this.invlist.length; i++){
			for(let j = 0; j < i; j++){
				let invi = this.invlist[i];
				let invj = this.invlist[j];
				if(invi.number == invj.number && invi.email == invj.email){
					if(new Date(invi.datetime) > new Date(invj.datetime)){
						invi.pay += invj.pay;
						this.invlist.splice(j,1);
					}else {
						invj += invi.pay;
						this.invlist.splice(i,1);
					}
				}
			}
		}
		this.invlist = this.invlist.sort((a,b)=> new Date(b.datetime) - new Date(a.datetime));
		console.log(this.invlist);
		let form = document.querySelector(".investor-form");
		this.invlist.forEach((x)=>{
			let div = document.createElement("div");
			div.classList.add("investor");
			let name = this.check(x.name, 11);
			let pay = parseInt(x.pay).toLocaleString();
			let percent = Math.floor(x.pay / x.total * 100);
			div.innerHTML = `
					<div>${x.number}</div>
					<div>${name}</div>
					<div>${x.email}</div>
					<div>${pay}원</div>
					<div><canvas width="120" height="30"></canvas> ${percent}%</div>
					<div>${x.datetime}</div>
			`;
			form.append(div);
			let canvas = div.querySelector("canvas");
			this.makeLine(canvas, x);
		})
	}

	registerLoader() {
		$(".register-email").on("focusout",(e)=>{
			this.checkNull(e.target, "이메일이");
		});
		$(".register-name").on("focusout",(e)=>{
			this.checkNull(e.target, "이름이");
		});
		$(".register-pass").on("focusout", (e)=>{
			this.checkPass(e.target, "비밀번호가");
		});
		$(".register-repass").on("focusout", (e)=>{
			let pass = document.querySelector(".register-pass");
			this.checkRepass(e.target, pass, "비밀번호 확인이");
		});
		$(".register-done").on("click", (e)=>{
			let ep = e.target.parentNode;
			let email = ep.querySelector(".register-email");
			let name = ep.querySelector(".register-name");
			let pass = ep.querySelector(".register-pass");
			let repass = ep.querySelector(".register-repass");
			this.checkNull(email, "이메일이");
			this.checkNull(name, "이름이");
			this.checkPass(pass, "비밀번호가");
			this.checkRepass(repass, pass, "비밀번호 확인이");
			let warning = ep.getElementsByClassName("warning");
			if(warning.length == 0){
				this.toast("회원가입에 성공하였습니다.");
			}
		})
	}

	checkRepass(e,p,v){
		this.checkNull(e,v);
		if($(e).hasClass("warning") == true){
			return;
		}
		if(p.value != e.value) {
			this.toast("비밀번호와 비밀번호 확인란의 값이 다릅니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}
	checkPass(e,v){
		this.checkNull(e,v);
		if($(e).hasClass("warning") == true){
			return;
		}
		let regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]+$/;
		if(e.value.match(regex) == null){
			this.toast("비밀번호는 영문,특문,숫자를 모두포함하여야 합니다.");
			e.classList.add("warning");
		}else {
			e.classList.remove("warning");
		}
	}
}

window.onload = function(){
	$.getJSON('/js/fund.json', function(result){
		let app = new App(result);
	});
	
}