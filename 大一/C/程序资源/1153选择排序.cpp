//本题要求采用选择排序算法将给定的n个整数从大到小排序后输出
//输入第一行给出一个不超过10的正整数n。第二行给出n个整数，其间以空格分隔。
//在一行中输出从大到小有序的数列，相邻数字间有一个空格，行末不得有多余空格。
#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int number[n];
	for(int i=0;i<n;i++)
	{
		scanf("%d",&number[i]);
	}
	for(int i=0;i<n-1;i++)
	{
		int maxindex=i;
		for(int j=i+1;j<n;j++){
			if(number[j]>number[maxindex]){
				maxindex=j;
			}
		}
		if(maxindex!=i){
			int temp=number[maxindex];
			number[maxindex]=number[i];
			number[i]=temp;//!!!!在每一轮内层循环结束后，如果maxindex不等于当前轮次的起始索引i，
			//就通过交换操作将最大元素与当前位置i的元素进行交换，以将最大元素放置到合适的位置。
		}
	}
	for(int i=0;i<n;i++)
	{
		printf("%d ",number[i]);
	}
	
	return 0;
}
