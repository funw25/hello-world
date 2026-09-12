//输入一批以-1结束的非负整数，统计所有数的各位数字之和。
#include"stdio.h"
int main()
{
	int a,sum=0,digit;
	//循环读取数字，直到输入-1 
	while(1){
		scanf("%d",&a);
		if(a==-1){
			break;
		}
		int t=a;
		while(t>0){
			digit=t%10;
			sum+=digit;
			t/=10;
		}
		
	}
	printf("%d",sum);
	
	
	return 0;
}
