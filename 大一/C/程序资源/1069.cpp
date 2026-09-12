//编程实现求s=1+12+123+1234+……+12...n的和。
#include<stdio.h> 
int main()
{
	int i,n,sum=0,j=0;
	scanf("%d",&n);
	for(i=1;i<=n;i++)
	{
		j=j*10+i;
		sum=sum+j;
	}
	printf("%d",sum);
	return 0;
}
