//本题要求对两个正整数m和n（m≤n）编写程序，计算序列和
//在一行中按照“sum = S”的格式输出部分和的值S，精确到小数点后六位。题目保证计算结果不超过双精度范围。
#include<stdio.h>
int main()
{
	int i,m,n;
	double sum=0;
	scanf("%d %d",&m,&n);
	for(i=m;i<=n;i++){
		sum=sum+i*i+1.0/i;
	}
	printf("sum = %.6f",sum);
	return 0;
}
