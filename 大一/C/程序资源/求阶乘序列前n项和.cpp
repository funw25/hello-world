//计算序列 1! + 2! + 3! +...的前N项之和。
//输入在一行中给出一个不超过12的正整数N
//在一行中输出整数结果
#include<stdio.h>
int main()
{
	int i,j=1,n,sum=0;
	scanf("%d",&n);
	for(i=1;i<=n;i++){
		j=j*i;
		sum=sum+j;
	}
	printf("%d",sum);
	return 0;
}
