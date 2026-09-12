//计算s=1!+2!+3!+...+10!。
//定义函数fac(n)求n的阶乘；
//定义函数sum(m)求m个数的和；
//主函数中定义变量，输入一个整数，调用函数sum(m)，函数sum(m)中调用函数fac(n)，输出结果。
#include"stdio.h"

int fact(int n){
	int result=1;
	for(int i=1;i<=n;i++)
	{
		result*=i;
	}
	return result;
}

int sum(int m){
	int sum=0;
	for(int i=1;i<=m;i++)
	{
		sum=sum+fact(i);
	}
	return sum;
}

int main()
{
	int x;
	scanf("%d",&x);
	printf("s=%d",sum(x));
	return 0;
}
