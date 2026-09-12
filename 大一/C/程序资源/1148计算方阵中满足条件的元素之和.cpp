//给定一个n×n的方阵，本题要求计算该矩阵除副对角线、最后一列和最后一行以外的所有元素之和。
//副对角线为从矩阵的右上角至左下角的连线。
//输入第一行给出正整数n（1<n≤10）；随后n行，每行给出n个整数，其间以空格分隔。
//在一行中给出该矩阵除副对角线、最后一列和最后一行以外的所有元素之和。
#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int a[n][n]; 
	for(int i=0;i<n;i++){
		for(int j=0;j<n;j++){
			scanf("%d",&a[i][j]);
		}
	}
	int sum=0;
	for(int i=0;i<n-1;i++){
		for(int j=0;j<n-1;j++){//排除了最后一行和最后一列。
			if(i+j!=n-1){//排除副对角线上的元素
				sum+=a[i][j];
			}
		}
	}
	printf("%d\n", sum);

	return 0;
}
