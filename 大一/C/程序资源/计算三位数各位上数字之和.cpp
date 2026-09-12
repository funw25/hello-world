#include<stdio.h> 
int main()
{
	int a,b,c,n,sum;
	scanf("%d",&n);
	a=n/100;
	b=n/10%10;
	c=n%10;
	sum=a+b+c;
	printf("%d",sum);
	return 0;
}
