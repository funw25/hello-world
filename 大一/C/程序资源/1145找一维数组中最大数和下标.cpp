//找出给定的n个数中的最大值及其对应的最小下标（下标从0开始）。
//输入在第一行中给出一个正整数n（1<n≤10）。第二行输入n个整数，用空格分开。
//在一行中输出最大值及最大值的最小下标，中间用一个空格分开。
#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int number[n];
	for(int i=0;i<n;i++){
		scanf("%d",&number[i]);
	}
	int max=number[0];
	int index=0;
	for(int i=1;i<n;i++){
		if(number[i]>max){
			max=number[i];
			index=i;
		}
	}
	printf("%d %d",max,index);
	
	return 0;
}
