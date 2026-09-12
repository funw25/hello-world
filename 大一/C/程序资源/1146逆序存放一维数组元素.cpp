//将给定的n个整数存入数组中，将数组中的这n个数逆序存放，再按顺序输出数组中的元素。
//输入在第一行中给出一个正整数n（1≤n≤10）。第二行输入n个整数，用空格分开。
//在一行中输出这n个整数的处理结果，相邻数字中间用一个空格分开。
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
	for(int i=n-1;i>=0;i--)
	{
		printf("%d ",number[i]);
	}
	return 0;
}
