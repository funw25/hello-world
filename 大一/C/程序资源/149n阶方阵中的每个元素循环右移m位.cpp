//本题要求编写程序，将给定n×n方阵中的每个元素循环向右移m个位置，
//即将第0、1、...n-1列变换为第n-m、n-m+1、...、n-1、0、1、…、n-m-1列。
//输入第一行给出两个正整数m和n（1≤n≤6）。接下来一共n行，每行n个整数，表示一个n阶的方阵。
//按照输入格式输出移动后的方阵：即输出n行，每行n个整数，每个整数后输出一个空格。
#include"stdio.h"
int main()
{
	int m,n;
	scanf("%d %d",&m,&n);
	int a[n][n];
	for(int i=0;i<n;i++){
		for(int j=0;j<n;j++){
			scanf("%d",&a[i][j]);
		}
	}
	for(int i=0;i<n;i++)
	{
		for(int j=n-m;j<n;j++)
		{
			printf("%d ",a[i][j]);
		}
		for(int j=0;j<n-m;j++)
		{
			printf("%d ",a[i][j]);
		}
		printf("\n");
	}
	return 0;
}
