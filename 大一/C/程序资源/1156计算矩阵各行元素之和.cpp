//求一个给定的mxn矩阵各行元素之和。
//输入第一行给出两个正整数m和n（1≤m,n≤6）。
//随后m行，每行给出n个整数，其间以空格分隔。
//每行输出对应矩阵行元素之和。
#include"stdio.h"
int main()
{
	int m,n;
	scanf("%d %d",&m,&n);
	//定义二维矩阵
	int a[m][n];
	for(int i=0;i<m;i++){
		for(int j=0;j<n;j++){
			scanf("%d",&a[i][j]);
		}
	}
    // 计算并输出每行元素之和
    for(int i=0;i<m;i++){
    	int sum=0;
    	for(int j=0;j<n;j++){
    		sum+=a[i][j];
		}
		printf("%d\n",sum);
	}
	return 0;
}



