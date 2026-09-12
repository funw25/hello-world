//本题要求统计给定整数M和N区间内素数的个数并对它们求和。
//输入在一行中给出两个正整数M和N（1≤M≤N≤500）。
//在一行中顺序输出M和N区间内素数的个数以及它们的和，数字间以空格分隔。
#include<stdio.h>
int main()
{
	int n,i,M,N,sum=0,j=0;
	scanf("%d %d",&M,&N);
	if(M==1){
		M=2;
	}
	for(n=M;n<=N;n++){
		for(i=2;i<n;i++){
			if(n%i==0)
			break;
		}
		if(i==n){
			j++;
			sum=sum+n;
		}
	}
	printf("%d %d",j,sum);
	return 0;
}
