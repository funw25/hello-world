#include<stdio.h> 
int main()
{
	int x,a,b,c,d;
    scanf("%d",&x);
	a=x/1000;
	b=x/100%10;
	c=x/10%10;
	d=x%10;
	a=(a+9)%10;
	b=(b+9)%10;
	c=(c+9)%10;
	d=(d+9)%10;
	x=c*1000+d*100+a*10+b;
	printf("The encrypted number is %d",x);
	return 0;
}
