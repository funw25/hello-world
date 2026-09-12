//输入n（n<=10）个学生成绩，输出平均值（保留两位小数）
//第一行输入1个整数，表示需要输入n个学生成绩 
//第二行输入n个整数，分别表示n个学生成绩，相邻两个整数之间有一个空格
//第1行输出n个整数，分别表示学生的成绩，相邻两个整数之间有一个空格 
//第2行输出一个实数，表示n个学生成绩的平均值（保留两位小数）

#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int score[n];
	for(int i=0;i<n;i++)
	{
		scanf("%d",&score[i]);
	}
	double sum=0;
	for(int i=0;i<n;i++)
	{
		sum=sum+score[i];
	}
	double ave=sum/n;
	for(int i=0;i<n;i++)
	{
		printf("%d ",score[i]);
	}
	printf("\n");
	printf("%.2f\n",ave);
	
	return 0;
}
