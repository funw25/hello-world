//要求两个给定正整数的最大公约数和最小公倍数。
//输入在一行中给出两个正整数M和N（N≤1000）。
//在一行中顺序输出M和N的最大公约数和最小公倍数，两数字间以1空格分隔。
#include<stdio.h>
int main()
{
	int m,n,gys,gbs,t;
	scanf("%d %d",&m,&n);
	
	int x=m,y=n;
	
	while(y!=0)
	{
		t=x%y;//求余数 
		x=y;
		y=t;//余数赋给y 
	}
	gys=x;
	gbs=(m*n)/gys;
	printf("%d %d",gys,gbs);
	return 0;
}
