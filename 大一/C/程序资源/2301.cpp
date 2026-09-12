//输入n个学生成绩，输出高于平均成绩的人数
//第一行输入1个整数，表示有n个学生
//第二行输入n个整数，表示n个学生的成绩，相邻两个数据之间用一个空格隔开
#include"stdio.h" 
int main()
{
	int n;
	scanf("%d",&n);
	int a[n];
	for(int i=0;i<n;i++){
		scanf("%d",&a[i]);
	}
	int sum=0;
	for(int i=0;i<n;i++){
		sum+=a[i];
	}
	double ave;
	ave=(double)sum/n;
	int count=0;
	for(int i=0;i<n;i++){
		if(a[i]>ave){
			count++;
		}
	}
	printf("%d",count);
	return 0;
}
