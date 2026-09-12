//打印一个高度为n的、由“*”组成的正菱形图案（每行最后一个星号的后面还有一个空格）。
//输入在一行中给出一个正的奇数n。
//输出由n行星号“*”组成的菱形，每个星号后跟一个空格。
#include<stdio.h>
int main()
{
	int n,i,k,j;
	scanf("%d",&n);
	for(i=1;i<=n;i+=2)
	{
		for(j=0;j<(n-i)/2;j++){
			printf("  ");
		}
		for(k=0;k<i;k++){
			printf("* ");
		}
		printf("\n");
	}
	for(i=n-2;i>=1;i-=2)
	{
		for(j=0;j<(n-i)/2;j++){
			printf("  ");
		}
		for(k=0;k<i;k++){
			printf("* ");
		}
		printf("\n");
	}
	return 0;
}
