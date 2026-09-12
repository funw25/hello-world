//输入2个正整数lower和upper，
//当lower≤upper≤100时输出一张取值范围为[lower，upper]、且每次增加2华氏度的华氏-摄氏温度转换表，
//否则输出"Invalid."。
//温度转换的计算公式：C=5×(F-32)/9，其中：C表示摄氏温度，F表示华氏温度。
//输入共一行，包含两个整数lower和upper，其间以空格分隔。
//若lower≤upper≤100，则
//输出共N行，第一行内容为"fahr celsius:"
//接下来的N-1行每行输出一个整数fahr和一个小数celsius，fahr代表华氏温度，celsius代表摄氏温度
//celsius要求占据6个字符宽度，靠右对齐，保留1位小数
//否则：输出共一行，内容为"Invalid."
//特别提醒：占据6个字符宽度，靠右对齐，保留1位小数，可通过%6.1f控制输出，因此本题使用%d%6.1f输出两个数字。

#include<stdio.h>
int main()
{
	int i,lower,upper;
	double c;
	scanf("%d %d",&lower,&upper);
	if(lower<=upper&&upper<=100){
		printf("fahr celsius:\n");
		for(i=lower;i<=upper;i+=2){
			c=5*(i-32)/9.0;
			printf("%d%6.1f\n",i,c);
		}
	}
	else{
		printf("Invalid.");
	}
	return 0;
}

