//计算给定的一系列正整数中奇数的和。
//输入共一行，包含任意个以空格分隔的正整数，随后包含一个非正整数，表示输入结束，该数字不要处理。
//输出共一行，包含一个整数，代表输入中的正整数序列中奇数的和
#include<stdio.h>
int main()
{
	int x,sum=0;
	while(1){
		scanf("%d",&x);
		if(x<=0){
			break;
		}
		if(x%2!=0){
			sum+=x;
		}
		
	}
	printf("%d",sum);
	return 0;
}
