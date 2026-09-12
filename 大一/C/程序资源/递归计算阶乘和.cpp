//本题要求实现一个计算非负整数阶乘的简单函数，并利用该函数求 1!+2!+3!+...+n! 的值。
//函数接口定义：
//double fact( int n );
//double factsum( int n );
//函数fact应返回n的阶乘，建议用递归实现。函数factsum应返回 1!+2!+...+n! 的值。题目保证输入输出在双精度范围内。

#include <stdio.h>
double fact( int n );
double factsum( int n );
int main(void) {
   int n;
   scanf("%d",&n);
   printf("fact(%d) = %.0f\n", n, fact(n));
   printf("sum = %.0f\n", factsum(n));
   return 0;
}
double fact( int n )
{
	int result=1;
	for(int i=1;i<=n;i++){
		result*=i;

	}
	return result;
}
double factsum( int n )
{
	int sum=0;
	for(int i=1;i<=n;i++){
		sum+=fact(i);

	}
	return sum;
}
