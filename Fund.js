class Fund {
	constructor(number, name, total, current, endDate, investorList){
		this.number = number;
		this.name = name;
		this.total = total;
		this.current = current;
		if(current == "" || current == null || current === undefined) this.current = 0;
		this.endDate = endDate;
		this.investorList = investorList;
	}
}