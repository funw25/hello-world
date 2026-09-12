//编程定义一个复数结构体，包含实部和虚部。
//计算两个复数的乘积。
//计算复数乘积的公式为(a1+(a2)i)*(b1+(b2)i)，
//乘积的实部为a1*b1-a2*b2，虚部为a1*b2+a2*b1。
//例如(3+4i)*(5+6i) = -9+38i
#include"stdio.h"
struct fs1
{
	double s;
	double x;
}fs;
int main()
{
	struct fs1 c1,c2,result;
	scanf("%lf %lf",&c1.s,&c1.x);
	scanf("%lf %lf",&c2.s,&c2.x);
	result.s=c1.s*c2.s-c1.x*c2.x;
	result.x=c1.s*c2.x+c1.x*c2.s;
	printf("%.2lf + %.2lfi\n", result.s, result.x);
	return 0;
}
