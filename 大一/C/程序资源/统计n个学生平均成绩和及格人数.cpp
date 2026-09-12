//计算班级平均成绩并统计及格（成绩不低于60分）的人数。题目保证输入与输出均在整型范围内。
//输入在第一行中给出非负整数N，即学生人数。第二行给出N个非负整数，即这N位学生的成绩，其间以空格分隔。
#include<stdio.h>
int main()
{
	int i=1,n,count=0,grade; 
	double average,sum=0;
	scanf("%d\n",&n);
	for(i=1;i<=n;i++){
		scanf("%d",&grade);
		sum+=grade;
		if(grade>=60){
			count++;
		}
		
	}
	average=sum/n;
	printf("average=%.1lf\ncount=%d",average,count);
	return 0;
}
