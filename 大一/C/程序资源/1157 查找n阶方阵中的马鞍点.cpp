//一个方阵中的“马鞍点”是指该位置上的元素值在该行上最大、在该列上最小。
//本题要求编写程序，求一个给定的n阶方阵的马鞍点。
//输入第一行给出一个正整数n（1≤n≤6）。随后n行，每行给出n个整数，其间以空格分隔。
//输出在一行中按照“行下标 列下标”（下标从0开始）的格式输出马鞍点的位置。
//如果鞍点不存在，则输出“NONE”。测试数据保证给出的矩阵至多存在一个马鞍点。
#include"stdio.h"
int main()
{
	int n;
	int q=0,w=0;
	scanf("%d",&n);
	int a[n][n];
	int b[n][n]={0};//将二维数组 b 的所有元素初始化为 0
	for(int i=0;i<n;i++){
		for(int j=0;j<n;j++){
			scanf("%d",&a[i][j]);
		}
	}
	for(int i=0;i<n;i++){
		int max=a[i][0];
		for(int j=0;j<n;j++){
			if(a[i][j]>max){
				max=a[i][j];
				q=j;
			}
		}
		b[i][q]++;
	}
	for(int i=0;i<n;i++){
		int min=a[0][i];
		for(int j=0;j<n;j++){
			if(a[j][i]<min){
				min=a[j][i];
				w=j;
			}
		}
		b[w][i]++;
	}
	int t=0;
	for(int i=0;i<n;i++)
	{
		for(int j=0;j<n;j++)
		{	
			if(b[i][j]==2)//检查在前面两步中记录的行最大值所在列和列最小值所在行的交叉位置。
			{
				t=1;
				printf("%d %d\n",i,j);
			}  
		}
	}
	if(t==0)
		{
			printf("NONE\n");
		}
	return 0;
}
