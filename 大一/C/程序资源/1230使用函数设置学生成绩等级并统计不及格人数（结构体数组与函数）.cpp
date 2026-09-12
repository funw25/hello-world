//本题要求利用结构体数组实现一个根据学生成绩设置其等级，
//并统计不及格人数的函数。
//set_grade函数需要根据学生的成绩score设置其等级grade。
//等级设置：85－100为A，70－84为B，60－69为C，0－59为D。
//同时，set_grade还需要返回不及格的人数。

#include <stdio.h>
#define MAXN 10

struct student{
    int num;
    char name[20];
    int score;
    char grade;
};

int set_grade( struct student p[], int n );

int main(){ 
    struct student stu[MAXN];
    int n, i, count;
    scanf("%d", &n);
    for(i = 0; i < n; i++){
       scanf("%d%s%d", &stu[i].num, stu[i].name, &stu[i].score);
    } 
   count = set_grade(stu, n);
   printf("The count for failed (<60): %d\n", count);
   printf("The grades:\n"); 
   for(i = 0; i < n; i++)
       printf("%d %s %c\n", stu[i].num, stu[i].name, stu[i].grade);
    return 0;
}
int set_grade( struct student p[], int n )
{
int fail_count = 0;
    for(int i = 0; i < n; i++){
        if(p[i].score >= 85 && p[i].score <= 100){
            p[i].grade = 'A';
        }
        else if(p[i].score >= 70 && p[i].score <= 84){
            p[i].grade = 'B';
        }
        else if(p[i].score >= 60 && p[i].score <= 69){
            p[i].grade = 'C';
        }
        else{
            p[i].grade = 'D';
            fail_count++;
        }
    }
    return fail_count;
	
	
}
