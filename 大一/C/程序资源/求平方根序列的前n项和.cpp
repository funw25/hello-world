//编写程序，计算平方根序列根号1+根号2+... 的前N项之和。可包含头文件math.h，并调用sqrt函数求平方根。
#include<stdio.h>
#include<math.h>
int main()
{
	int n,i=1;
	double sum=0;
	scanf("%d",&n);
	while(i<=n){
		sum=sum+sqrt(i);
		i++; 
	}
	printf("sum=%.2lf",sum);
	return 0;	
}
