//计算序列 1 + 1/3 + 1/5 + ... 的前N项之和。
#include<stdio.h>
int main()
{
	int i,n;
	double sum=1;
	scanf("%d",&n);
	for(i=1;i<n;i++){
		sum=sum+1.0/(i*2.0+1.0);
	}
	printf("sum=%.6f",sum);
	return 0; 
}
