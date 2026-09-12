#include<stdio.h>
int main()
{
	int m,n,gys,gbs,t;
	scanf("%d %d",&m,&n);
	int x=m,y=n;
	while(y!=0){
		t=x%y;//求余数 
		x=y;
		y=t;//余数赋给y 
	}
	gys=x;
	gbs=(m*n)/gys;
	printf("最小公倍数为%d, 最大公约数为%d",gbs,gys);
	return 0;
}
