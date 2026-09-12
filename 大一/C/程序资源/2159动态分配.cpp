//已知一个学生信息包括学号，姓名，成绩三个成员，
//要求使用动态申请存储空间的方式从内存中分配一个存储单元，
//然后输入学生信息并输出学生信息
#include <stdio.h>
#include <stdlib.h>

// 定义学生结构体
typedef struct {
    int num;
    char name[20];
    int score;
} Student;

int main() {
    Student *stu;
    // 动态分配内存
    stu = (Student *)malloc(sizeof(Student));
    
    // 输入学生信息
    scanf("%d %s %d", &stu->num, &stu->name, &stu->score);
    // 输出学生信息
    printf("%d %s %d\n", stu->num, stu->name, stu->score);
    // 释放内存
    free(stu);
    return 0;
}
