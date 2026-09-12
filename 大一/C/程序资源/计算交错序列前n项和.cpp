//计算序列 1 - 1/4 + 1/7 - 1/10 + ... 的前N项之和。
#include<stdio.h>
int main()
{
	int n,i;
	double sum=0;
	int sign=1;//用于交替符号，初始为正 
	scanf("%d",&n);
	for(i=0;i<n;i++){
		int denominator=1+3*i;//计算当前项的分母 
		sum=sum+sign*(1.0/denominator);
		sign=-sign;//交替符号 
	}
	printf("sum=%.3f",sum);
	return 0;
}
