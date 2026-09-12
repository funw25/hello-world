//输入一个非负整数n，生成一张3的乘方表，输出3的0次方到3的n次方的值。可调用幂函数计算3的乘方。
//输入在一行中给出一个非负整数n。
//按照幂的递增顺序输出n+1行，每行格式为“pow(3,i)=3的i次幂的值”。题目保证输出数据不超过长整型整数的范围。
#include<stdio.h>
#include<math.h>
int main()
{
	int i,n;
	long x;
	scanf("%d",&n);
	for(i=0;i<=n;i++)
	{
		x=pow(3,i);
		printf("pow(3,%d)=%ld\n",i,x);
	}
	return 0;
}
