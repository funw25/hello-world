//输入一个整数，统计该整数的位数
//本题需要考虑到特殊值0是一个只有1位的整数; 还可能输入的是负数。
#include<stdio.h>
int main()
{
	int a,count=0; 
	scanf("%d",&a);
	if(a==0){
		count=1;
	}
	else{
		while(a){
		a/=10;
		count++;	
		}
	}
	printf("%d",count);
	return 0;
}
