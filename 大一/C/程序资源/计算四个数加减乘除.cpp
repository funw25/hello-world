#include<stdio.h>
int main() 
{
	int a,b,sum,c,d,e;
	scanf("%d %d",&a,&b);
	sum=a+b; 
	c=a-b; 
	d=a*b; 
	e=a/b;
	printf("%d + %d = %d\n",a,b,sum);
	printf("%d - %d = %d\n",a,b,c);
	printf("%d * %d = %d\n",a,b,d);
	printf("%d / %d = %d\n",a,b,e);
	return 0;
}
