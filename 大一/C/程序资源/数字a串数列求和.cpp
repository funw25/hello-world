//给定两个均不超过9的正整数a和n，要求编写程序求a+aa+aaa++...+aa...a（n个a）之和。
#include<stdio.h>
int main()
{
	int i,a,n,k=0,sum=0;
	scanf("%d %d",&a,&n);
	for(i=0;i<n;i++){
		k=k*10+a;
		sum=sum+k;
	}
	printf("s=%d",sum);
	return 0;
}
